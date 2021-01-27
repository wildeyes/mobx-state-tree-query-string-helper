import { IAnyType, types } from "mobx-state-tree";

export const optionalNullType = <T extends IAnyType>(type: T) =>
  types.optional(types.maybeNull(type), null);
