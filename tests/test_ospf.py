"""
Automated Routing & OSPF Verification Suite
Validates control plane routing configurations, static routes, and OSPF parameters.
"""
import os
import re
import pytest

WORKSPACE_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CONFIGS_DIR = os.path.join(WORKSPACE_ROOT, "configs")


@pytest.fixture(scope="module")
def vyos_config():
    cfg_path = os.path.join(CONFIGS_DIR, "vyos-lab-gw.cfg")
    assert os.path.exists(cfg_path), f"vyos-lab-gw config not found at {cfg_path}"
    with open(cfg_path, "r") as f:
        return f.read()


def test_routing_engine_control_plane(vyos_config):
    """Verify that VyOS router has default routing and control plane routes established"""
    assert "set protocols static route 0.0.0.0/0 next-hop" in vyos_config, (
        "VyOS default gateway route 0.0.0.0/0 missing"
    )
    print("\n[PASS] Upstream static default route verified on vyos-lab-gw.")


def test_ospf_or_stub_routing_readiness(vyos_config):
    """
    Verify routing policy integrity. For single-tier edge lab subnets,
    verifies stub network routing isolation or validates OSPF area syntax if enabled.
    """
    has_ospf = "set protocols ospf" in vyos_config
    if has_ospf:
        assert re.search(r"set protocols ospf area \d+ network", vyos_config), (
            "OSPF area network definition missing in VyOS config"
        )
        print("\n[PASS] OSPF area and network statement verified.")
    else:
        # Edge stub gateway: verify direct connected interface routes for lab VLAN and mgmt
        assert "interfaces ethernet eth0 address" in vyos_config, "Management interface route missing"
        assert "interfaces ethernet eth1 vif 100 address" in vyos_config, "Lab VLAN 100 route missing"
        print("\n[PASS] Stub network direct interface routing verified for edge lab.")
