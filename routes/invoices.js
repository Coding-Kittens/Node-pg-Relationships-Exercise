const express = require("express");
const db = require("../db");
const router = new express.Router();
const ExpressError = require("../expressError");

router.get("/", async (req, res, next) => {
  try {
    const result = await db.query("SELECT id, comp_code FROM invoices");
    return res.json({ invoices: result.rows });
  } catch (e) {
    return next(e);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const id = req.params.id;
    const result = await db.query(
      `SELECT * FROM invoices JOIN companies On comp_code=companies.code WHERE id=$1`,
      [id]
    );
    if (result.rows.length === 0) {
      throw new ExpressError(`Invoice with id of ${id} not found!`, 404);
    }
    const {
      amt,
      paid,
      add_date,
      paid_date,
      code,
      name,
      description,
    } = result.rows[0];
    return res.json({
      invoice: {
        id,
        amt,
        paid,
        add_date,
        paid_date,
        company: { code, name, description },
      },
    });
  } catch (e) {
    return next(e);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const { comp_code, amt } = req.body;
    const result = await db.query(
      `INSERT INTO invoices (comp_code,amt) Values($1,$2) RETURNING *`,
      [comp_code, amt]
    );
    return res.status(201).json({ invoice: result.rows[0] });
  } catch (e) {
    return next(e);
  }
});

router.put("/:id", async (req, res, next) => {
  try {
    const id = req.params.id;
    const {amt,paid} = req.body;
    let paid_date;

    paid? paid_date = new Date(): paid_date = null;


    const result = await db.query(
      `UPDATE invoices SET amt=$2, paid=$3, paid_date=$4  WHERE id=$1 RETURNING *`,
      [id, amt, paid, paid_date]
    );

    if (result.rows.length === 0) {
      throw new ExpressError(`Invoice with id of ${id} not found!`, 404);
    }
    return res.json({ invoice: result.rows[0]});
  } catch (e) {
    return next(e);
  }
});



router.delete("/:id", async (req, res, next) => {
  try {
    const id = req.params.id;
    const result = await db.query(
      `DELETE FROM invoices WHERE id=$1 RETURNING id`,
      [id]
    );

    if (result.rows.length === 0) {
      throw new ExpressError(`Invoice with id of ${id} not found!`, 404);
    }

    return res.json({ status: "deleted" });
  } catch (e) {
    return next(e);
  }
});

module.exports = router;
