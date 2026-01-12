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
var project_store_exports = {};
__export(project_store_exports, {
  projectStore: () => projectStore
});
module.exports = __toCommonJS(project_store_exports);
class ProjectStore {
  constructor() {
    this.projects = /* @__PURE__ */ new Map();
  }
  create(project) {
    this.projects.set(project.id, project);
    return project;
  }
  findAll(tenantId) {
    return Array.from(this.projects.values()).filter(
      (project) => project.tenant_id === tenantId
    );
  }
  findById(id, tenantId) {
    const project = this.projects.get(id);
    if (project && project.tenant_id === tenantId) {
      return project;
    }
    return void 0;
  }
  update(id, tenantId, updates) {
    const project = this.findById(id, tenantId);
    if (!project) {
      return void 0;
    }
    const updatedProject = {
      ...project,
      ...updates,
      id: project.id,
      tenant_id: project.tenant_id,
      created_at: project.created_at,
      updated_at: /* @__PURE__ */ new Date()
    };
    this.projects.set(id, updatedProject);
    return updatedProject;
  }
  delete(id, tenantId) {
    const project = this.findById(id, tenantId);
    if (!project) {
      return false;
    }
    return this.projects.delete(id);
  }
}
const projectStore = new ProjectStore();
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  projectStore
});
