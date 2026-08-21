/**
 * The sales executive's Company Name picker splits the team's book into "Own
 * Retailers" and "Team Retailers". The list itself is the team's whole book, so
 * ownership comes from a separate call for the executive's own retailers and
 * the two are matched by id. MUI only draws one header per group when the
 * options are already ordered by group, so this checks the ordering holds even
 * with the selected user prepended and "Add New Retailer" appended.
 *
 * Mirrors isOwnRetailer and the sort/groupBy pair in
 * src/forms/SuperAdmin/SaleForm.js.
 */
const assert = require("assert");
const _ = require("lodash");

const ADD_ID = "__add_admin__";

/* the ids the own-retailer call returned for this executive */
let ownRetailerIds = [];
const isOwn = (option) =>
  ownRetailerIds.some((id) => String(id) === String(option.id));

const groupOf = (option) =>
  option.id !== ADD_ID && isOwn(option) ? "Own Retailers" : "Team Retailers";

const order = (options) =>
  _.sortBy(options, (option) =>
    option.id === ADD_ID ? 2 : isOwn(option) ? 0 : 1
  );

const headers = (options) =>
  order(options)
    .map(groupOf)
    .filter((group, i, all) => i === 0 || all[i - 1] !== group);

// company_name order from the API must survive inside each group
ownRetailerIds = [2, 4];
assert.deepStrictEqual(
  order([
    { id: 1, company_name: "Alpha" },
    { id: 2, company_name: "Beta" },
    { id: 3, company_name: "Gamma" },
    { id: 4, company_name: "Delta" },
    { id: ADD_ID, company_name: "Add New Retailer" },
  ]).map((o) => o.company_name),
  ["Beta", "Delta", "Alpha", "Gamma", "Add New Retailer"]
);

// the two calls disagree on id type often enough to be worth pinning
ownRetailerIds = ["2"];
assert.deepStrictEqual(headers([{ id: 2 }, { id: 1 }, { id: ADD_ID }]), [
  "Own Retailers",
  "Team Retailers",
]);

// one header per group, add option folded into the team's
ownRetailerIds = [2];
assert.deepStrictEqual(headers([
  { id: 1 },
  { id: 2 },
  { id: ADD_ID },
]), ["Own Retailers", "Team Retailers"]);

// a selected retailer missing from the list is prepended, and must not open a
// second header of a group already drawn
ownRetailerIds = [1];
assert.deepStrictEqual(headers([
  { id: 9 },
  { id: 1 },
  { id: 2 },
  { id: ADD_ID },
]), ["Own Retailers", "Team Retailers"]);

// an executive with nothing of its own, or whose own-retailer call has not
// landed yet, still gets a single team list rather than an empty heading
ownRetailerIds = [];
assert.deepStrictEqual(headers([
  { id: 1 },
  { id: 2 },
  { id: ADD_ID },
]), ["Team Retailers"]);

console.log("ok");
