import escape from "escape-regexp";
import mongoose from "mongoose";

/**
 * Changes AdminBro's {@link Filter} to an object acceptible by a mongoose query.
 *
 * @param {Filter} filter
 * @private
 */
export const convertFilter = (filter) => {
  if (!filter) {
    return {};
  }
  return filter.reduce((memo, filterProperty) => {
    const { property, value, path } = filterProperty;
    switch (property ? property.type() : typeof value) {
      case "string":
        return {
          [path]: { $regex: escape(value), $options: "i" },
          ...memo,
        };
      case "date":
      case "datetime":
        if (value.from || value.to) {
          return {
            [path]: {
              ...(value.from && { $gte: value.from }),
              ...(value.to && { $lte: value.to }),
            },
            ...memo,
          };
        }
        break;
      case "id":
        if (mongoose.Types.ObjectId.isValid(value)) {
          return {
            [path]: value,
            ...memo,
          };
        }
        return {};
      default:
        break;
    }
    return {
      [path]: value,
      ...memo,
    };
  }, {});
};
