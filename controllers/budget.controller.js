import { AppError, catchAsync } from '../middleware/error.middleware.js';
import { Budget } from '../models/Budget.model.js';
import { startOfYear } from "date-fns";
// Create a budget entry
export const createBudget = catchAsync(async (req,res)=>{
  const { title, type, amount, category } = req.body;
    const { clubId } = req.params;
    console.log(clubId);
    
    const createdBy = req.user.id;
    if(!title || !type || !amount ||!clubId){
      throw new AppError("Validation Failed", 400)
    }
    const budget = await Budget.create({ title, type, amount, category, clubId:clubId, createdBy });
    res.status(201).json({ success: true, data: budget });
})

// Get all budget items for a club
export const getClubBudgets = catchAsync(async (req, res) => {
  const { clubId } = req.params;
  const { startDate, endDate, year } = req.query;

  const query = { clubId };

  if (year) {
    // Filter budgets for the whole year (Jan 1st - Dec 31st)
    const start = new Date(`${year}-01-01`);
    const end = new Date(`${parseInt(year) + 1}-01-01`);
    query.createdAt = { $gte: start, $lt: end };
  }

  if (startDate && endDate) {
    query.createdAt = {
      $gte: new Date(startDate),
      $lte: new Date(endDate),
    };
  }

  const budgets = await Budget.find(query)
    .populate("createdBy", "name email");

  res.json({ success: true, data: budgets });
});

// Get monthly/yearly summary
export const getBudgetSummary = catchAsync(async (req,res)=>{
   const { clubId } = req.params;
    const { year, month } = req.query; // optional

    const filter = { club: clubId };
    if (year && month) {
      filter.createdAt = {
        $gte: new Date(`${year}-${month}-01`),
        $lt: new Date(`${year}-${parseInt(month) + 1}-01`)
      };
    } else if (year) {
      filter.createdAt = {
        $gte: new Date(`${year}-01-01`),
        $lt: new Date(`${parseInt(year) + 1}-01-01`)
      };
    }

    const budgets = await Budget.find(filter);
    const summary = budgets.reduce((acc, item) => {
      acc[item.type] += item.amount;
      return acc;
    }, { income: 0, expense: 0 });

    res.json({ success: true, data: summary });
})

export const updateBudget=catchAsync(async (req,res)=>{
   const { id } = req.params;
   const {clubId}=req.param
  const { title, type, amount, category } = req.body;

  const budget = await Budget.findById(id);
  if (!budget) {
    throw new AppError("Budget entry not found", 404);
  }
    if (title !== undefined) budget.title = title;
  if (type !== undefined) budget.type = type;
  if (amount !== undefined) budget.amount = amount;
  if (category !== undefined) budget.category = category;
  budget.clubId=clubId;
  await budget.save();

  res.json({ success: true, data: budget });
})

// Delete budget entry
export const deleteBudget =catchAsync(async (req,res)=>{
  const { id } = req.params;
    await Budget.findByIdAndDelete(id);
    res.json({ success: true, message: "Budget entry deleted" });
})


export const getMonthlyBudgetSummart=catchAsync(async (req,res)=>{
   const clubId = req.params.id;

    const currentYear = new Date().getFullYear();
    const start = startOfYear(new Date(currentYear, 0, 1));

    const records = await Budget.aggregate([
      {
        $match: {
          club: clubId,
          createdAt: { $gte: start },
        },
      },
      {
        $project: {
          month: { $month: "$createdAt" },
          amount: 1,
          type: 1,
        },
      },
      {
        $group: {
          _id: { month: "$month", type: "$type" },
          total: { $sum: "$amount" },
        },
      },
    ]);

    // Format into: { Jan: { income: ..., expense: ... }, ... }
    const monthMap = {};

    for (let i = 1; i <= 12; i++) {
      const monthName = new Date(0, i - 1).toLocaleString("default", { month: "short" });
      monthMap[i] = { month: monthName, income: 0, expense: 0 };
    }

    records.forEach((r) => {
      const m = monthMap[r._id.month];
      if (r._id.type === "income") m.income = r.total;
      if (r._id.type === "expense") m.expense = r.total;
    });

    const result = Object.values(monthMap);

    res.status(200).json({ success: true, data: result });
})