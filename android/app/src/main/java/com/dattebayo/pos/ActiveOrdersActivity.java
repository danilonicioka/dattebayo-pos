package com.dattebayo.pos;

import android.content.Intent;
import android.os.Bundle;
import android.widget.Toast;
import androidx.appcompat.app.AppCompatActivity;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;
import androidx.swiperefreshlayout.widget.SwipeRefreshLayout;
import com.dattebayo.pos.api.ApiService;
import com.dattebayo.pos.api.RetrofitClient;
import com.dattebayo.pos.model.Order;
import com.google.android.material.floatingactionbutton.FloatingActionButton;
import java.util.ArrayList;
import java.util.List;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class ActiveOrdersActivity extends AppCompatActivity implements ActiveOrderAdapter.OnOrderActionListener {

    private RecyclerView rvActiveOrders;
    private ActiveOrderAdapter adapter;
    private SwipeRefreshLayout swipeRefresh;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_active_orders);

        // Setup RecyclerView
        rvActiveOrders = findViewById(R.id.rvActiveOrders);
        rvActiveOrders.setLayoutManager(new LinearLayoutManager(this));
        adapter = new ActiveOrderAdapter();
        adapter.setOnOrderActionListener(this);
        rvActiveOrders.setAdapter(adapter);

        // Setup SwipeRefresh
        swipeRefresh = findViewById(R.id.swipeRefresh);
        swipeRefresh.setOnRefreshListener(this::fetchActiveOrders);

        // Setup FAB
        FloatingActionButton fabNewOrder = findViewById(R.id.fabNewOrder);
        fabNewOrder.setOnClickListener(v -> startActivity(new Intent(ActiveOrdersActivity.this, OrderActivity.class)));

        // Setup Refresh Button
        findViewById(R.id.btnRefresh).setOnClickListener(v -> fetchActiveOrders());

        // Initial Load
        fetchActiveOrders();
    }

    private void fetchActiveOrders() {
        swipeRefresh.setRefreshing(true);
        ApiService apiService = RetrofitClient.getApiService();
        apiService.getAllOrders().enqueue(new Callback<List<Order>>() {
            @Override
            public void onResponse(Call<List<Order>> call, Response<List<Order>> response) {
                swipeRefresh.setRefreshing(false);
                if (response.isSuccessful() && response.body() != null) {
                    List<Order> allOrders = response.body();
                    List<Order> activeOrders = new ArrayList<>();
                    for (Order order : allOrders) {
                        String status = (order.getStatus() != null) ? order.getStatus() : "";
                        if (!"COMPLETED".equals(status) && !"CANCELLED".equals(status)) {
                            activeOrders.add(order);
                        }
                    }
                    adapter.setOrders(activeOrders);
                } else {
                    Toast.makeText(ActiveOrdersActivity.this, "Failed to load orders", Toast.LENGTH_SHORT).show();
                }
            }

            @Override
            public void onFailure(Call<List<Order>> call, Throwable t) {
                swipeRefresh.setRefreshing(false);
                Toast.makeText(ActiveOrdersActivity.this, "Error: " + t.getMessage(), Toast.LENGTH_SHORT).show();
            }
        });
    }

    @Override
    protected void onResume() {
        super.onResume();
        fetchActiveOrders();
    }

    @Override
    public void onEdit(Order order) {
        Toast.makeText(this, "Edit feature coming soon", Toast.LENGTH_SHORT).show();
    }

    @Override
    public void onCancel(Order order) {
         ApiService apiService = RetrofitClient.getApiService();
         apiService.updateOrderStatus(order.getId(), "CANCELLED").enqueue(new Callback<Order>() {
             @Override
             public void onResponse(Call<Order> call, Response<Order> response) {
                 if (response.isSuccessful()) {
                     Toast.makeText(ActiveOrdersActivity.this, "Order Cancelled", Toast.LENGTH_SHORT).show();
                     fetchActiveOrders();
                 }
             }

             @Override
             public void onFailure(Call<Order> call, Throwable t) {
                 Toast.makeText(ActiveOrdersActivity.this, "Failed to cancel", Toast.LENGTH_SHORT).show();
             }
         });
    }

    @Override
    public void onPay(Order order) {
        ApiService apiService = RetrofitClient.getApiService();
        apiService.updateOrderStatus(order.getId(), "COMPLETED").enqueue(new Callback<Order>() {
            @Override
            public void onResponse(Call<Order> call, Response<Order> response) {
                if (response.isSuccessful()) {
                    Toast.makeText(ActiveOrdersActivity.this, "Order Paid & Completed", Toast.LENGTH_SHORT).show();
                    fetchActiveOrders();
                }
            }

            @Override
            public void onFailure(Call<Order> call, Throwable t) {
                Toast.makeText(ActiveOrdersActivity.this, "Failed to update", Toast.LENGTH_SHORT).show();
            }
        });
    }
}
