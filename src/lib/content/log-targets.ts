import type {
  LogEntry,
} from "./types";

export function logTargetIds(
  entry: LogEntry,
): string[] {
  if (
    entry.data.type ===
    "content-batch"
  ) {
    return entry.data.items.map(
      (item) => item.target,
    );
  }

  return entry.data.targets;
}

export function automaticReplacementTargetIds(
  entry: LogEntry,
): string[] {
  if (
    !entry.data
      .replacesAutomaticEntries
  ) {
    return [];
  }

  const targetIds =
    entry.data.type ===
    "content-batch"
      ? entry.data.items
          .filter(
            (item) =>
              item.operation === "add",
          )
          .map(
            (item) => item.target,
          )
      : entry.data.operation === "add"
        ? entry.data.targets
        : [];

  return [
    ...new Set(targetIds),
  ];
}