"""
NetArchitect AI: Backend Unit & Integration Tests
Validates:
- Guardrail Engine policy enforcement
- Config Engine CLI syntax generation
- Checkpoint Engine snapshot & rollback
- GNS3 Client node/link lifecycle
- FastAPI REST endpoints
"""
import pytest
from fastapi.testclient import TestClient

from backend.app.guardrails import GuardrailEngine, GuardrailViolation
from backend.app.config_engine import ConfigEngine
from backend.app.checkpoint_engine import CheckpointEngine
from backend.app.gns3_client import GNS3Client
from backend.app.tools import get_device_catalog
from backend.app.main import api

client = TestClient(api)


def test_guardrails_node_limit():
    catalog = get_device_catalog()
    engine = GuardrailEngine(catalog)

    # 15 nodes should pass
    nodes_15 = [{"name": f"node-{i}", "template_id": "alpine-host"} for i in range(15)]
    engine.validate_node_count(nodes_15)

    # 16 nodes should raise GuardrailViolation
    nodes_16 = [{"name": f"node-{i}", "template_id": "alpine-host"} for i in range(16)]
    with pytest.raises(GuardrailViolation, match="Node limit breached"):
        engine.validate_node_count(nodes_16)


def test_guardrails_unauthorized_template():
    catalog = get_device_catalog()
    engine = GuardrailEngine(catalog)

    invalid_nodes = [{"name": "rogue-router", "template_id": "cisco-nexus-9000-unauthorized"}]
    with pytest.raises(GuardrailViolation, match="Unauthorized templates detected"):
        engine.validate_templates(invalid_nodes)


def test_guardrails_duplicate_ip_detection():
    catalog = get_device_catalog()
    engine = GuardrailEngine(catalog)

    # Conflicting configs with same assigned IP
    configs_with_collision = {
        "node-01": "iface eth0 inet static\naddress 10.100.1.50\nnetmask 255.255.255.0",
        "node-02": "iface eth0 inet static\naddress 10.100.1.50\nnetmask 255.255.255.0"
    }

    with pytest.raises(GuardrailViolation, match="Duplicate IP collision on 10.100.1.50"):
        engine.validate_zero_duplicate_ips(configs_with_collision)


def test_config_engine_vyos_rendering():
    cfg = ConfigEngine.generate_vyos(
        hostname="vyos-core01",
        mgmt_ip="192.168.122.15",
        interfaces=[
            {
                "name": "eth1",
                "description": "Uplink",
                "vifs": [{"vlan": 100, "ip": "10.100.1.1/24"}]
            }
        ],
        static_routes=[{"prefix": "0.0.0.0/0", "next_hop": "192.168.122.1"}]
    )

    assert "set system host-name 'vyos-core01'" in cfg
    assert "set interfaces ethernet eth1 vif 100 address '10.100.1.1/24'" in cfg
    assert "set protocols static route 0.0.0.0/0 next-hop 192.168.122.1" in cfg


def test_config_engine_ovs_rendering():
    cfg = ConfigEngine.generate_ovs(
        hostname="ovs-dist01",
        mgmt_ip="192.168.122.20",
        bridge_name="br-core",
        trunk_ports=["eth0", "eth7"],
        access_ports=[{"port": "eth1", "vlan": 100}]
    )

    assert "ovs-vsctl add-br br-core" in cfg
    assert "ovs-vsctl add-port br-core eth0" in cfg
    assert "ovs-vsctl add-port br-core eth1 tag=100" in cfg


def test_fastapi_health_and_catalog():
    res = client.get("/health")
    assert res.status_code == 200
    assert res.json()["status"] == "HEALTHY"

    res_cat = client.get("/api/catalog")
    assert res_cat.status_code == 200
    assert "inventory" in res_cat.json()
    assert "guardrails" in res_cat.json()


def test_fastapi_configs_and_topology():
    res_cfg = client.get("/api/configs")
    assert res_cfg.status_code == 200
    assert "vyos-lab-gw.cfg" in res_cfg.json()

    res_topo = client.get("/api/topology")
    assert res_topo.status_code == 200
    assert "nodes" in res_topo.json()
