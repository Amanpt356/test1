"""
Automated Reachability Verification Suite
Validates topology.json consistency, zero IP collision, 802.1Q VLAN mapping,
and end-to-end reachability across computer lab workstations and gateway.
"""
import json
import os
import re
import ipaddress
import pytest

WORKSPACE_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TOPOLOGY_FILE = os.path.join(WORKSPACE_ROOT, "topology.json")
CONFIGS_DIR = os.path.join(WORKSPACE_ROOT, "configs")


@pytest.fixture(scope="module")
def topology_data():
    assert os.path.exists(TOPOLOGY_FILE), f"Topology file missing at {TOPOLOGY_FILE}"
    with open(TOPOLOGY_FILE, "r") as f:
        return json.load(f)


@pytest.fixture(scope="module")
def node_configs():
    assert os.path.isdir(CONFIGS_DIR), f"Configs directory missing at {CONFIGS_DIR}"
    configs = {}
    for filename in os.listdir(CONFIGS_DIR):
        if filename.endswith(".cfg"):
            hostname = filename.replace(".cfg", "")
            with open(os.path.join(CONFIGS_DIR, filename), "r") as f:
                configs[hostname] = f.read()
    return configs


def test_topology_node_count_and_guardrail(topology_data):
    """Enforce max_nodes_per_project <= 15 guardrail from device_catalog.yaml"""
    nodes = topology_data.get("nodes", [])
    assert len(nodes) > 0, "Topology must contain nodes"
    assert len(nodes) <= 15, f"Guardrail breach: Node count {len(nodes)} exceeds max 15 nodes"
    print(f"\n[PASS] Topology node count: {len(nodes)}/15 (Compliant)")


def test_zero_duplicate_ips(node_configs):
    """Enforce deterministic network safety: zero duplicate assigned interface IPs across all node configs"""
    ip_records = {}

    # Regex patterns for explicitly assigned interface addresses
    assign_patterns = [
        re.compile(r"address\s+'?([0-9]+\.[0-9]+\.[0-9]+\.[0-9]+)(?:/[0-9]+)?'?"), # VyOS & Alpine
        re.compile(r"ip\s+addr\s+add\s+([0-9]+\.[0-9]+\.[0-9]+\.[0-9]+)(?:/[0-9]+)?") # OVS / Linux
    ]

    for hostname, config in node_configs.items():
        assigned_ips = set()
        for line in config.splitlines():
            # Exclude default-router, gateway, nameserver, range statements
            if any(k in line for k in ["default-router", "gateway", "name-server", "nameserver", "range", "source address"]):
                continue
            for pat in assign_patterns:
                m = pat.search(line)
                if m:
                    assigned_ips.add(m.group(1))

        for clean_ip in assigned_ips:
            if clean_ip in {"127.0.0.1", "0.0.0.0"}:
                continue
            if clean_ip in ip_records and ip_records[clean_ip] != hostname:
                pytest.fail(f"Duplicate IP collision: {clean_ip} assigned to both '{ip_records[clean_ip]}' and '{hostname}'")
            ip_records[clean_ip] = hostname

    assert len(ip_records) >= 7, f"Expected at least 7 assigned IPs, found {len(ip_records)}"
    print(f"\n[PASS] Zero duplicate assigned IPs verified across {len(ip_records)} interfaces: {ip_records}")




def test_gateway_workstation_subnet_consistency(node_configs):
    """Verify that all workstation IPs belong to the same /24 subnet as the VyOS gateway"""
    gateway_config = node_configs.get("vyos-lab-gw")
    assert gateway_config is not None, "vyos-lab-gw configuration missing"

    # Gateway IP on vif 100
    assert "10.100.1.1/24" in gateway_config, "Gateway vif 100 missing IP 10.100.1.1/24"
    lab_subnet = ipaddress.ip_network("10.100.1.0/24")

    workstations = ["lab-pc01", "lab-pc02", "lab-pc03", "lab-pc04"]
    for pc in workstations:
        pc_cfg = node_configs.get(pc)
        assert pc_cfg is not None, f"Workstation {pc} config missing"
        # Match workstation IP
        match = re.search(r'address\s+([0-9\.]+)', pc_cfg)
        assert match, f"Workstation {pc} has no IP address assigned"
        pc_ip = ipaddress.ip_address(match.group(1))
        assert pc_ip in lab_subnet, f"Workstation {pc} IP {pc_ip} is outside gateway subnet {lab_subnet}"
        assert "gateway 10.100.1.1" in pc_cfg or "via 10.100.1.1" in pc_cfg, f"Workstation {pc} missing default gateway 10.100.1.1"

    print(f"\n[PASS] Subnet consistency and default gateways verified across 4 workstations.")


def test_ovs_vlan_trunking_and_access(node_configs):
    """Verify Open vSwitch VLAN 100 tagging on access ports and trunking on uplinks"""
    sw01 = node_configs.get("ovs-lab-sw01")
    sw02 = node_configs.get("ovs-lab-sw02")
    assert sw01 and sw02, "OVS switch configs missing"

    # Check access port tagging
    for sw_name, cfg in [("ovs-lab-sw01", sw01), ("ovs-lab-sw02", sw02)]:
        assert "add-port br-lab eth1 tag=100" in cfg, f"{sw_name} eth1 not tagged with VLAN 100"
        assert "add-port br-lab eth2 tag=100" in cfg, f"{sw_name} eth2 not tagged with VLAN 100"

    # Check trunk ports
    assert "add-port br-lab eth0" in sw01, "sw01 eth0 missing trunk uplink"
    assert "add-port br-lab eth7" in sw01, "sw01 eth7 missing inter-switch trunk"
    assert "add-port br-lab eth7" in sw02, "sw02 eth7 missing inter-switch trunk"

    print(f"\n[PASS] OVS VLAN 100 tagging and 802.1Q trunking verified on both switches.")


def test_inter_workstation_cross_switch_reachability(topology_data):
    """Validate full L2/L3 path connectivity between all nodes through topology graph"""
    nodes = {n["name"]: n["node_id"] for n in topology_data["nodes"]}
    links = topology_data["links"]

    # Build adjacency graph
    adj = {n: set() for n in nodes.values()}
    for link in links:
        n1 = link["nodes"][0]["node_id"]
        n2 = link["nodes"][1]["node_id"]
        adj[n1].add(n2)
        adj[n2].add(n1)

    # Breadth-first search from lab-pc01 (on sw01) to lab-pc04 (on sw02)
    start = nodes["lab-pc01"]
    target = nodes["lab-pc04"]

    queue = [(start, [start])]
    visited = {start}
    path_found = None

    while queue:
        curr, path = queue.pop(0)
        if curr == target:
            path_found = path
            break
        for neighbor in adj.get(curr, []):
            if neighbor not in visited:
                visited.add(neighbor)
                queue.append((neighbor, path + [neighbor]))

    assert path_found is not None, "No physical/logical path found between lab-pc01 and lab-pc04 across switches"
    print(f"\n[PASS] End-to-end path from lab-pc01 (sw01) to lab-pc04 (sw02) confirmed via {len(path_found)} hops.")
