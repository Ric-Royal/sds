/* The native page loader skips construction when frappe.pages[name] already exists. */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");

test("global assets leave native page construction and handler registration to the page loader", () => {
  const erp = path.resolve(__dirname, "..");
  const frappe = { pages: {}, ui: { form: { on() {} } } };
  frappe.provide = (name) => {
    const parts = name.split(".");
    assert.equal(parts.shift(), "frappe");
    let target = frappe;
    for (const part of parts) target = target[part] ||= {};
  };
  const context = vm.createContext({ frappe });
  vm.runInContext(fs.readFileSync(path.join(erp, "sds_ops/public/js/operations.js"), "utf8"), context);
  assert.equal(frappe.pages["sds-operations"], undefined, "Global assets must not create a phantom page");
  assert.equal(typeof frappe.sds_ops.render_operations_page, "function");

  // Frappe creates and registers its DOM wrapper before evaluating Page.__script.
  const wrapper = { page_name: "sds-operations" };
  frappe.pages["sds-operations"] = wrapper;
  vm.runInContext(fs.readFileSync(path.join(erp, "sds_ops/sds_operations/page/sds_operations/sds_operations.js"), "utf8"), context);
  assert.equal(frappe.pages["sds-operations"], wrapper);
  assert.equal(wrapper.on_page_load, frappe.sds_ops.render_operations_page);
});
