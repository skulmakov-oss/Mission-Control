import type { SemanticGraphEvent, NodeStatus } from "./events";

export function adaptAgOutputToEvents(rawJson: any): SemanticGraphEvent[] {
  const events: SemanticGraphEvent[] = [];
  const run_id = rawJson.timestamp_utc || new Date().toISOString();
  
  // 1. run.started
  events.push({
    event: "run.started",
    run_id,
    timestamp: new Date().toISOString(),
    metadata: {
      checker_name: rawJson.checker_name,
      mode: rawJson.mode,
    }
  });

  const targetId = `target-${rawJson.target_name || "unknown"}`;
  events.push({
    event: "node.added",
    run_id,
    timestamp: new Date().toISOString(),
    node: {
      id: targetId,
      kind: "module",
      label: rawJson.target_name || "Target",
      status: "pending"
    }
  });

  // 2. Add audit node
  const auditId = `audit-${run_id}`;
  if (rawJson.audit) {
    const auditStatus: NodeStatus = rawJson.audit.verdict?.includes("PASS") ? "verified" : "warning";
    events.push({
      event: "node.added",
      run_id,
      timestamp: new Date().toISOString(),
      node: {
        id: auditId,
        kind: "rule",
        label: "Audit",
        status: auditStatus,
        metadata: rawJson.audit
      }
    });

    events.push({
      event: "edge.added",
      run_id,
      timestamp: new Date().toISOString(),
      edge: {
        id: `edge-${targetId}-${auditId}`,
        source: targetId,
        target: auditId,
        type: "contains"
      }
    });
  }

  // 3. Add command nodes
  if (Array.isArray(rawJson.commands)) {
    rawJson.commands.forEach((cmd: any, i: number) => {
      const cmdId = `cmd-${i}-${cmd.category}`;
      const status: NodeStatus = cmd.status === "pass" ? "verified" : (cmd.status === "fail" ? "conflict" : "pending");
      
      let label = "command";
      if (cmd.command) {
        const parts = cmd.command.split(" ");
        label = parts[0] + (parts[1] ? ` ${parts[1]}` : "");
      }

      events.push({
        event: "node.added",
        run_id,
        timestamp: new Date().toISOString(),
        node: {
          id: cmdId,
          kind: "effect",
          label,
          status,
          metadata: {
            command: cmd.command,
            exit_code: cmd.exit_code,
            stderr_tail: cmd.stderr_tail
          }
        }
      });
      
      events.push({
        event: "edge.added",
        run_id,
        timestamp: new Date().toISOString(),
        edge: {
          id: `edge-${auditId}-${cmdId}`,
          source: auditId,
          target: cmdId,
          type: "calls"
        }
      });

      if (cmd.status === "fail") {
        events.push({
          event: "conflict.detected",
          run_id,
          timestamp: new Date().toISOString(),
          conflict: {
            message: `Command failed: ${cmd.command}`,
            command: cmd.command
          }
        });
      }
    });
  }

  // 4. emit verdict
  const finalStatus = rawJson.status === "pass" ? "admitted" : (rawJson.status === "fail" ? "rejected" : "needs_review");
  events.push({
    event: "verdict.emitted",
    run_id,
    timestamp: new Date().toISOString(),
    verdict: {
      status: finalStatus,
      reason: rawJson.failure_summary || "Checks complete"
    }
  });

  // 5. update target node status based on verdict
  events.push({
    event: "node.updated",
    run_id,
    timestamp: new Date().toISOString(),
    node_id: targetId,
    patch: {
      status: finalStatus === "admitted" ? "admitted" : "rejected"
    }
  });

  // 6. run.completed
  events.push({
    event: "run.completed",
    run_id,
    timestamp: new Date().toISOString(),
  });

  return events;
}
