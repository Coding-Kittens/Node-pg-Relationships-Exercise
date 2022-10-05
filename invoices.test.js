process.env.NODE_ENV = "test";
const request = require("supertest");
const app = require("./app");
const db = require("./db");

beforeEach(async () => {
  await db.query(
    `INSERT INTO companies (code,name,description) Values('testcode','testName','this is a test') RETURNING *`
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
    let invoice1 = db.query(
      `INSERT INTO invoices (id,amt,comp_code) Values(12,200,'testcode')`
    );
    let invoice2 = db.query(
      `INSERT INTO invoices (id,amt,comp_code) Values(13,394,'testcode')`
    );
    await invoice1;
    await invoice2;

    const res = await request(app).get("/invoices");
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      invoices: [
        { id: 12, comp_code: "testcode" },
        { id: 13, comp_code: "testcode" },
      ],
    });
  });

  test("Get by id", async () => {
    await db.query(
      `INSERT INTO invoices (id,amt,comp_code) Values(12,200,'testcode')`
    );

    const res = await request(app).get("/invoices/12");
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ invoice: { id: "12",amt:200,add_date: expect.any(String), paid: false, paid_date: null,company:{code:'testcode',name:'testName',description:'this is a test'} } });
  });

  test("Get by id should return 404 if id not found", async () => {
    const res = await request(app).delete("/invoices/817");
    expect(res.statusCode).toBe(404);
  });
});

describe("Test Post", () => {
  test("Create new", async () => {
    const res = await request(app)
      .post("/invoices")
      .send({ comp_code: "testcode", amt: 350.4 });
    expect(res.statusCode).toBe(201);
    expect(res.body).toEqual({
      invoice: { id: expect.any(Number), comp_code: "testcode", amt: 350.4,add_date: expect.any(String), paid: false, paid_date: null },
    });
  });
});

describe("Test Put", () => {
  test("Update by id", async () => {
    await db.query(
      `INSERT INTO invoices (id,amt,comp_code) Values(10,200,'testcode')`
    );
    const res = await request(app)
      .put("/invoices/10")
      .send({ comp_code: "testcode", amt: 3050.4, paid: true });
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      invoice: { id: 10, comp_code: "testcode", amt: 3050.4,paid: true, paid_date: expect.any(String), add_date: expect.any(String) },
    });
  });


  test("Update by id should return 404 if id not found", async () => {
    const res = await request(app)
      .put("/invoices/653")
      .send({ comp_code: "testcode", amt: 3050.4 });
    expect(res.statusCode).toBe(404);
  });
});

describe("Test Delete", () => {
  test("Delete by id", async () => {
    await db.query(
      `INSERT INTO invoices (id,amt,comp_code) Values(10,200,'testcode')`
    );
    const res = await request(app).delete("/invoices/10");
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ status: "deleted" });
  });

  test("Delete by id should return 404 if id not found", async () => {
    const res = await request(app).delete("/invoices/653");
    expect(res.statusCode).toBe(404);
  });
});
