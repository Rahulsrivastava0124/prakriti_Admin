/**
 * The sales executive's Company Name picker splits the team's book into "My
 * Retailers" and "Team Retailers". MUI only draws one header per group when the
 * options are already ordered by group, so this checks the ordering holds even
 * with the selected user prepended and "Add New Retailer" appended.
 *
 * Mirrors the sort/groupBy pair in src/forms/SuperAdmin/SaleForm.js.
 */
const assert = require("assert");
const _ = require("lodash");

const ADD_ID = "__add_admin__";

const groupOf = (option) =>
  option.id !== ADD_ID && option.is_my_retailer ? "Own Retailers" : "Team Retailers";

const order = (options) =>
  _.sortBy(options, (option) =>
    option.id === ADD_ID ? 2 : option.is_my_retailer ? 0 : 1
  );

const headers = (options) =>
  order(options)
    .map(groupOf)
    .filter((group, i, all) => i === 0 || all[i - 1] !== group);

// company_name order from the API must survive inside each group
assert.deepStrictEqual(
  order([
    { id: 1, company_name: "Alpha", is_my_retailer: false },
    { id: 2, company_name: "Beta", is_my_retailer: true },
    { id: 3, company_name: "Gamma", is_my_retailer: false },
    { id: 4, company_name: "Delta", is_my_retailer: true },
    { id: ADD_ID, company_name: "Add New Retailer" },
  ]).map((o) => o.company_name),
  ["Beta", "Delta", "Alpha", "Gamma", "Add New Retailer"]
);

// one header per group, add option folded into the team's
assert.deepStrictEqual(headers([
  { id: 1, is_my_retailer: false },
  { id: 2, is_my_retailer: true },
  { id: ADD_ID },
]), ["Own Retailers", "Team Retailers"]);

// a selected retailer missing from the list is prepended, and must not open a
// second header of a group already drawn
assert.deepStrictEqual(headers([
  { id: 9, is_my_retailer: false },
  { id: 1, is_my_retailer: true },
  { id: 2, is_my_retailer: false },
  { id: ADD_ID },
]), ["Own Retailers", "Team Retailers"]);

// an executive with nothing of its own still gets a single team list
assert.deepStrictEqual(headers([
  { id: 1, is_my_retailer: false },
  { id: 2, is_my_retailer: false },
  { id: ADD_ID },
]), ["Team Retailers"]);

console.log("ok");
