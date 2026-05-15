package backend.dto;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

public class TransactionSummaryDTO {
    private BigDecimal totalIncome;
    private BigDecimal totalExpense;
    private BigDecimal profit;
    private List<CategorySummary> incomeByCategory;
    private List<CategorySummary> expenseByCategory;

    public TransactionSummaryDTO() {}

    public TransactionSummaryDTO(BigDecimal totalIncome, BigDecimal totalExpense, BigDecimal profit,
                                  List<CategorySummary> incomeByCategory, List<CategorySummary> expenseByCategory) {
        this.totalIncome = totalIncome;
        this.totalExpense = totalExpense;
        this.profit = profit;
        this.incomeByCategory = incomeByCategory;
        this.expenseByCategory = expenseByCategory;
    }

    public BigDecimal getTotalIncome() { return totalIncome; }
    public void setTotalIncome(BigDecimal totalIncome) { this.totalIncome = totalIncome; }
    public BigDecimal getTotalExpense() { return totalExpense; }
    public void setTotalExpense(BigDecimal totalExpense) { this.totalExpense = totalExpense; }
    public BigDecimal getProfit() { return profit; }
    public void setProfit(BigDecimal profit) { this.profit = profit; }
    public List<CategorySummary> getIncomeByCategory() { return incomeByCategory; }
    public void setIncomeByCategory(List<CategorySummary> incomeByCategory) { this.incomeByCategory = incomeByCategory; }
    public List<CategorySummary> getExpenseByCategory() { return expenseByCategory; }
    public void setExpenseByCategory(List<CategorySummary> expenseByCategory) { this.expenseByCategory = expenseByCategory; }

    public static class CategorySummary {
        private String category;
        private BigDecimal amount;

        public CategorySummary() {}

        public CategorySummary(String category, BigDecimal amount) {
            this.category = category;
            this.amount = amount;
        }

        public String getCategory() { return category; }
        public void setCategory(String category) { this.category = category; }
        public BigDecimal getAmount() { return amount; }
        public void setAmount(BigDecimal amount) { this.amount = amount; }
    }
}
