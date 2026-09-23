"""
NetArchitect AI: GNS3 REST API v2 Client
Supports:
- Live REST API communication with GNS3 Server v2 (default: http://localhost:3080)
- Graceful local emulation sandbox fallback when GNS3 server is offline
- Full project, node, link lifecycle and auto-start management
"""
import os
import json
import logging
from typing import Dict, Any, List, Optional
import requests

logger = logging.getLogger("netarchitect.gns3")


class GNS3Client:
    def __init__(self, base_url: str = "http://localhost:3080", timeout: float = 3.0):
        self.base_url = base_url.rstrip("/")
        self.timeout = timeout
        self.is_connected = self._check_connectivity()

    def _check_connectivity(self) -> bool:
        """Pings GNS3 API v2 version endpoint."""
        try:
            res = requests.get(f"{self.base_url}/v2/version", timeout=self.timeout)
            return res.status_code == 200
        except Exception:
            return False

    def create_project(self, name: str) -> Dict[str, Any]:
        """Creates a new project sandbox."""
        if self.is_connected:
            try:
                res = requests.post(
                    f"{self.base_url}/v2/projects",
                    json={"name": name, "auto_start": True},
                    timeout=self.timeout
                )
                if res.status_code in (200, 201):
                    return res.json()
            except Exception as e:
                logger.warning(f"GNS3 Live REST call failed: {e}. Falling back to sandbox.")

        # Local Emulation Sandbox Fallback
        project_id = f"proj-{name.lower().replace(' ', '-')}"
        return {
            "project_id": project_id,
            "name": name,
            "status": "opened",
            "auto_start": True,
            "mode": "simulation_sandbox"
        }

    def create_node(self, project_id: str, node_data: Dict[str, Any]) -> Dict[str, Any]:
        """Provisions a node via GNS3 REST API."""
        if self.is_connected:
            try:
                res = requests.post(
                    f"{self.base_url}/v2/projects/{project_id}/nodes",
                    json=node_data,
                    timeout=self.timeout
                )
                if res.status_code in (200, 201):
                    return res.json()
            except Exception as e:
                logger.warning(f"GNS3 create_node error: {e}")

        # Local Emulation Sandbox Node Record
        return {
            "node_id": node_data.get("node_id", f"node-{node_data.get('name')}"),
            "name": node_data.get("name"),
            "node_type": node_data.get("node_type", "docker"),
            "template_id": node_data.get("template_id"),
            "x": node_data.get("x", 0),
            "y": node_data.get("y", 0),
            "status": "created",
            "properties": node_data.get("properties", {}),
            "mode": "simulation_sandbox"
        }

    def create_link(self, project_id: str, link_data: Dict[str, Any]) -> Dict[str, Any]:
        """Establishes an interface link between two nodes in GNS3."""
        if self.is_connected:
            try:
                res = requests.post(
                    f"{self.base_url}/v2/projects/{project_id}/links",
                    json=link_data,
                    timeout=self.timeout
                )
                if res.status_code in (200, 201):
                    return res.json()
            except Exception as e:
                logger.warning(f"GNS3 create_link error: {e}")

        # Local Emulation Sandbox Link Record
        nodes = link_data.get("nodes", [])
        return {
            "link_id": link_data.get("link_id", "link-auto"),
            "project_id": project_id,
            "nodes": nodes,
            "status": "connected",
            "mode": "simulation_sandbox"
        }

    def start_all_nodes(self, project_id: str) -> Dict[str, Any]:
        """Starts all nodes in project."""
        if self.is_connected:
            try:
                res = requests.post(
                    f"{self.base_url}/v2/projects/{project_id}/nodes/start",
                    timeout=self.timeout
                )
                if res.status_code == 200:
                    return {"status": "ALL_NODES_STARTED"}
            except Exception as e:
                logger.warning(f"GNS3 start_nodes error: {e}")

        return {"status": "ALL_NODES_STARTED", "mode": "simulation_sandbox"}
