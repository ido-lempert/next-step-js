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
var projects_exports = {};
__export(projects_exports, {
  projectRouter: () => projectRouter
});
module.exports = __toCommonJS(projects_exports);
var import_express = require("express");
var import_uuid = require("uuid");
var import_project_store = require("../models/project-store");
const projectRouter = (0, import_express.Router)();
function validateProjectName(name) {
  if (!name || typeof name !== "string") {
    return "Name is required";
  }
  if (name.trim().length === 0) {
    return "Name cannot be empty";
  }
  if (name.length > 255) {
    return "Name must not exceed 255 characters";
  }
  return null;
}
projectRouter.get("/", (req, res) => {
  try {
    const tenantId = req.tenantId;
    const projects = import_project_store.projectStore.findAll(tenantId);
    res.json(projects);
  } catch (error) {
    console.error("Error fetching projects:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
projectRouter.get("/:id", (req, res) => {
  try {
    const { id } = req.params;
    const tenantId = req.tenantId;
    const project = import_project_store.projectStore.findById(id, tenantId);
    if (!project) {
      res.status(404).json({ error: "Project not found" });
      return;
    }
    res.json(project);
  } catch (error) {
    console.error("Error fetching project:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
projectRouter.post("/", (req, res) => {
  try {
    const tenantId = req.tenantId;
    const dto = req.body;
    const nameError = validateProjectName(dto.name);
    if (nameError) {
      res.status(400).json({ error: nameError });
      return;
    }
    const project = import_project_store.projectStore.create({
      id: (0, import_uuid.v4)(),
      tenant_id: tenantId,
      name: dto.name.trim(),
      description: dto.description?.trim() || void 0,
      created_at: /* @__PURE__ */ new Date(),
      updated_at: /* @__PURE__ */ new Date()
    });
    res.status(201).json(project);
  } catch (error) {
    console.error("Error creating project:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
projectRouter.put("/:id", (req, res) => {
  try {
    const { id } = req.params;
    const tenantId = req.tenantId;
    const dto = req.body;
    if (dto.name !== void 0) {
      const nameError = validateProjectName(dto.name);
      if (nameError) {
        res.status(400).json({ error: nameError });
        return;
      }
    }
    const updates = {};
    if (dto.name !== void 0) {
      updates.name = dto.name.trim();
    }
    if (dto.description !== void 0) {
      updates.description = dto.description.trim() || void 0;
    }
    const updatedProject = import_project_store.projectStore.update(id, tenantId, updates);
    if (!updatedProject) {
      res.status(404).json({ error: "Project not found" });
      return;
    }
    res.json(updatedProject);
  } catch (error) {
    console.error("Error updating project:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
projectRouter.delete("/:id", (req, res) => {
  try {
    const { id } = req.params;
    const tenantId = req.tenantId;
    const deleted = import_project_store.projectStore.delete(id, tenantId);
    if (!deleted) {
      res.status(404).json({ error: "Project not found" });
      return;
    }
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting project:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  projectRouter
});
