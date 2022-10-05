process.env.NODE_ENV = "test";
const request = require("supertest");
const app = require("./app");
const db = require("./db");

beforeEach(async () => {
  await db.query(
    `INSERT INTO companies (code,name,description) Values('testcode','testName','this is a test')`
  );
});

afterEach(async () => {
  await db.query(`DELETE FROM companies`);
  await db.query(`DELETE FROM invoices`);
  await db.query(`DELETE FROM industries`);
  await db.query(`DELETE FROM company_industries`);
});

afterAll(async () => {
  await db.end();
});

describe("Test Get", () => {
  test("Get all", async () => {
    await db.query(`INSERT INTO industries (code, industry)
      VALUES ('acct', 'Accounting')`);

    await db.query(`INSERT INTO company_industries (comp_code, industry_code)
      VALUES ('testcode','acct')`);

    const res = await request(app).get("/industries");
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      industries: {
        code: "acct",
        industry: "Accounting",
        companies: ["testcode"],
      },
    });
  });
});

describe("Test Post", () => {
  test("Create new Industry", async () => {
    const res = await request(app)
      .post("/industries")
      .send({ code: "testCode", industry: "testIndustry" });
    expect(res.statusCode).toBe(201);
    expect(res.body).toEqual({
      industry: { code: "testCode", industry: "testIndustry" },
    });
  });

  test("Create new Company Industry", async () => {
    await db.query(`INSERT INTO industries (code, industry)
        VALUES ('acct', 'Accounting')`);

    const res = await request(app)
      .post("/industries/acct/company")
      .send({ comp_code: "testcode" });
    expect(res.statusCode).toBe(201);
    expect(res.body).toEqual({
      company_industry: { comp_code: "testcode", industry_code: "acct" },
    });
  });

  test("Create new Company Industry return 404 if code not found", async () => {
    const res = await request(app)
      .post("/industries/acct/company")
      .send({ comp_code: "testcode" });
    expect(res.statusCode).toBe(404);
  });
});
