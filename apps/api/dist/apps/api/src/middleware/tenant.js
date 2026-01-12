var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var tenant_exports = {};
__export(tenant_exports, {
  tenantMiddleware: () => tenantMiddleware
});
module.exports = __toCommonJS(tenant_exports);
function tenantMiddleware(req, res, next) {
  const tenantId = req.headers["x-tenant-id"];
  if (!tenantId) {
    res.status(400).json({ error: "Tenant ID is required" });
    return;
  }
  req.tenantId = tenantId;
  next();
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  tenantMiddleware
});
