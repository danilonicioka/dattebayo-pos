package com.dattebayo.pos;

import android.content.Intent;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.TextView;
import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;
import com.dattebayo.pos.api.ApiService;
import com.dattebayo.pos.api.RetrofitClient;
import com.dattebayo.pos.model.MenuItem;
import com.dattebayo.pos.model.Order;
import com.dattebayo.pos.model.OrderItem;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class SalesSummaryActivity extends AppCompatActivity {

    private TextView tvTotalRevenue;
    private TextView tvTotalItems;
    private RecyclerView rvCategories;
    private SalesCategoryAdapter adapter;
    private Map<String, String> itemCategoryMap = new HashMap<>();

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_sales_summary);

        tvTotalRevenue = findViewById(R.id.tvTotalRevenue);
        tvTotalItems = findViewById(R.id.tvTotalItems);
        rvCategories = findViewById(R.id.rvCategories);


        rvCategories.setLayoutManager(new LinearLayoutManager(this));
        adapter = new SalesCategoryAdapter(new ArrayList<>());
        rvCategories.setAdapter(adapter);



        fetchMenuAndSales();
    }

    private void fetchMenuAndSales() {
        ApiService apiService = RetrofitClient.getApiService();
        
        // 1. Fetch Menu Items to build Category Map
        apiService.getAllMenu().enqueue(new Callback<List<MenuItem>>() {
            @Override
            public void onResponse(Call<List<MenuItem>> call, Response<List<MenuItem>> response) {
                if (response.isSuccessful() && response.body() != null) {
                    for (MenuItem item : response.body()) {
                        itemCategoryMap.put(item.getName(), item.getCategory() != null ? item.getCategory() : "Others");
                    }
                    // 2. Fetch Sales Data
                    fetchCompletedOrders();
                }
            }

            @Override
            public void onFailure(Call<List<MenuItem>> call, Throwable t) {
                // Determine what to do on failure, maybe retry or just fetch orders assuming "Others"
                fetchCompletedOrders();
            }
        });
    }

    private void fetchCompletedOrders() {
        ApiService apiService = RetrofitClient.getApiService();
        apiService.getCompletedOrders().enqueue(new Callback<List<Order>>() {
            @Override
            public void onResponse(Call<List<Order>> call, Response<List<Order>> response) {
                if (response.isSuccessful() && response.body() != null) {
                    calculateStats(response.body());
                }
            }

            @Override
            public void onFailure(Call<List<Order>> call, Throwable t) {
                // Show error
            }
        });
    }

    private void calculateStats(List<Order> orders) {
        double totalRevenue = 0;
        int totalItems = 0;
        Map<String, CategoryStats> categoryStatsMap = new HashMap<>();

        for (Order order : orders) {
            totalRevenue += order.getTotal();
            if (order.getItems() != null) {
                for (OrderItem item : order.getItems()) {
                    int qty = item.getQuantity() != null ? item.getQuantity() : 0;
                    totalItems += qty;
                    
                    String category = itemCategoryMap.getOrDefault(item.getMenuItemName(), "Others");
                    CategoryStats stats = categoryStatsMap.getOrDefault(category, new CategoryStats(category));
                    stats.itemsSold += qty;
                    stats.revenue += (item.getPrice() != null ? item.getPrice() : 0) * qty; // Approx
                    categoryStatsMap.put(category, stats);
                }
            }
        }

        tvTotalRevenue.setText(String.format("$%.2f", totalRevenue));
        tvTotalItems.setText(String.valueOf(totalItems));
        
        adapter.updateData(new ArrayList<>(categoryStatsMap.values()));
    }

    // Helper classes
    static class CategoryStats {
        String name;
        int itemsSold;
        double revenue;
        public CategoryStats(String name) { this.name = name; }
    }

    static class SalesCategoryAdapter extends RecyclerView.Adapter<SalesCategoryAdapter.ViewHolder> {
        List<CategoryStats> list;
        public SalesCategoryAdapter(List<CategoryStats> list) { this.list = list; }
        public void updateData(List<CategoryStats> list) { this.list = list; notifyDataSetChanged(); }

        @NonNull @Override
        public ViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
             return new ViewHolder(LayoutInflater.from(parent.getContext()).inflate(R.layout.item_sales_category, parent, false));
        }
        @Override
        public void onBindViewHolder(@NonNull ViewHolder holder, int position) {
            CategoryStats stats = list.get(position);
            holder.tvName.setText(stats.name);
            holder.tvStats.setText(stats.itemsSold + " Items | " + String.format("$%.2f", stats.revenue));
        }
        @Override public int getItemCount() { return list.size(); }
        static class ViewHolder extends RecyclerView.ViewHolder {
            TextView tvName, tvStats;
            public ViewHolder(View v) { super(v); tvName = v.findViewById(R.id.tvCategoryName); tvStats = v.findViewById(R.id.tvCategoryStats); }
        }
    }
}
