// src/utils/hierarchyUtils.ts
import { MuscleGroupHierarchyItem } from '../api/muscleGroupService';
import { MuscleGroup } from '../api/muscleService';

/**
 * Flattens a hierarchy tree into an array.
 *
 * @param items The hierarchy items to flatten
 * @param result Optional array to store the result
 * @returns Array of all items in the hierarchy
 */
export function flattenHierarchy(
  items: MuscleGroupHierarchyItem[],
  result: MuscleGroup[] = []
): MuscleGroup[] {
  items.forEach((item) => {
    result.push(item);
    if (item.children && item.children.length > 0) {
      flattenHierarchy(item.children, result);
    }
  });
  return result;
}

/**
 * Finds all children (direct and indirect) of a group in the hierarchy.
 *
 * @param items The hierarchy to search in
 * @param groupId The ID of the group to find children for
 * @returns Array of all child group IDs
 */
export function findAllChildrenIds(
  items: MuscleGroupHierarchyItem[],
  groupId: string
): string[] {
  const result: string[] = [];

  // Helper function to recursively collect child IDs
  const collectChildIds = (item: MuscleGroupHierarchyItem) => {
    result.push(item.id);
    if (item.children && item.children.length > 0) {
      item.children.forEach(collectChildIds);
    }
  };

  // Find the target group and collect its children
  const findAndCollect = (items: MuscleGroupHierarchyItem[]): boolean => {
    for (const item of items) {
      if (item.id === groupId) {
        // Found the target, collect its children
        if (item.children && item.children.length > 0) {
          item.children.forEach(collectChildIds);
        }
        return true;
      }

      // Check children recursively
      if (item.children && item.children.length > 0) {
        if (findAndCollect(item.children)) {
          return true;
        }
      }
    }

    return false;
  };

  findAndCollect(items);
  return result;
}

/**
 * Finds the path to a group in the hierarchy.
 *
 * @param items The hierarchy to search in
 * @param groupId The ID of the group to find
 * @param path Current path array (used in recursion)
 * @returns Array of groups forming the path, or empty array if not found
 */
export function findPathToGroup(
  items: MuscleGroupHierarchyItem[],
  groupId: string,
  path: MuscleGroupHierarchyItem[] = []
): MuscleGroupHierarchyItem[] {
  for (const item of items) {
    // Try this item
    const newPath = [...path, item];

    // If this is the target, return the path
    if (item.id === groupId) {
      return newPath;
    }

    // If this item has children, recursively search them
    if (item.children && item.children.length > 0) {
      const foundPath = findPathToGroup(item.children, groupId, newPath);
      if (foundPath.length > 0) {
        return foundPath;
      }
    }
  }

  // Not found
  return [];
}

/**
 * Checks if moving a group would create a circular reference.
 *
 * @param items The hierarchy to check in
 * @param groupId The ID of the group being moved
 * @param targetId The ID of the proposed new parent
 * @returns True if move would create a circular reference
 */
export function wouldCreateCircularReference(
  items: MuscleGroupHierarchyItem[],
  groupId: string,
  targetId: string
): boolean {
  // If moving to null (root level), no circular reference possible
  if (!targetId) return false;

  // If target is the same as group, circular reference
  if (groupId === targetId) return true;

  // Check if target is a descendant of the group
  const childIds = findAllChildrenIds(items, groupId);
  return childIds.includes(targetId);
}

/**
 * Creates a map of group IDs to their parent group IDs.
 *
 * @param items The hierarchy to process
 * @param result Optional map to store the result
 * @returns Map of group IDs to their parent group IDs
 */
export function createParentMap(
  items: MuscleGroupHierarchyItem[],
  result: Map<string, string | null> = new Map(),
  parentId: string | null = null
): Map<string, string | null> {
  items.forEach((item) => {
    result.set(item.id, parentId);
    if (item.children && item.children.length > 0) {
      createParentMap(item.children, result, item.id);
    }
  });
  return result;
}

/**
 * Gets the depth of a group in the hierarchy.
 *
 * @param items The hierarchy to check in
 * @param groupId The ID of the group
 * @returns The depth of the group (0 for root level)
 */
export function getGroupDepth(
  items: MuscleGroupHierarchyItem[],
  groupId: string
): number {
  const path = findPathToGroup(items, groupId);
  return path.length - 1; // Subtract 1 because the path includes the group itself
}
