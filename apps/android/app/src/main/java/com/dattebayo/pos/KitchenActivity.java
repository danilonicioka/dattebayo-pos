package com.dattebayo.pos;

import android.os.Bundle;
import android.widget.Toast;
import androidx.appcompat.app.AppCompatActivity;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;
import androidx.swiperefreshlayout.widget.SwipeRefreshLayout;
import com.dattebayo.pos.api.ApiService;
import com.dattebayo.pos.api.RetrofitClient;
import com.dattebayo.pos.model.Order;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;
import java.util.ArrayList;
import java.util.List;

public class KitchenActivity extends AppCompatActivity {

    private RecyclerView rvKitchenOrders;
    private SwipeRefreshLayout swipeRefresh;
    private OrderAdapter adapter;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_kitchen);

        rvKitchenOrders = findViewById(R.id.rvKitchenOrders);
        swipeRefresh = findViewById(R.id.swipeRefresh);

        rvKitchenOrders.setLayoutManager(new LinearLayoutManager(this));
        adapter = new OrderAdapter(new ArrayList<>(), this::markOrderReady);
        rvKitchenOrders.setAdapter(adapter);

        loadOrders();

        swipeRefresh.setOnRefreshListener(this::loadOrders);
    }

    private void loadOrders() {
        swipeRefresh.setRefreshing(true);
        ApiService apiService = RetrofitClient.getApiService();
        apiService.getKitchenOrders().enqueue(new Callback<List<Order>>() {
            @Override
            public void onResponse(Call<List<Order>> call, Response<List<Order>> response) {
                swipeRefresh.setRefreshing(false);
                if (response.isSuccessful() && response.body() != null) {
                    adapter.updateData(response.body());
                } else {
                    Toast.makeText(KitchenActivity.this, "Failed to load orders", Toast.LENGTH_SHORT).show();
                }
            }

            @Override
            public void onFailure(Call<List<Order>> call, Throwable t) {
                swipeRefresh.setRefreshing(false);
                Toast.makeText(KitchenActivity.this, "Error: " + t.getMessage(), Toast.LENGTH_SHORT).show();
            }
        });
    }

    private void markOrderReady(Order order) {
        ApiService apiService = RetrofitClient.getApiService();
        // Assuming workflow: PENDING -> PREPARING -> READY
        // For simplicity, let's just jump to READY for now or move to next status
        String nextStatus = "READY"; 
        
        apiService.updateOrderStatus(order.getId(), nextStatus).enqueue(new Callback<Order>() {
            @Override
            public void onResponse(Call<Order> call, Response<Order> response) {
                if (response.isSuccessful()) {
                    Toast.makeText(KitchenActivity.this, "Order " + order.getId() + " updated", Toast.LENGTH_SHORT).show();
                    loadOrders(); // Refresh list
                } else {
                    Toast.makeText(KitchenActivity.this, "Failed to update order", Toast.LENGTH_SHORT).show();
                }
            }

            @Override
            public void onFailure(Call<Order> call, Throwable t) {
                Toast.makeText(KitchenActivity.this, "Error: " + t.getMessage(), Toast.LENGTH_SHORT).show();
            }
        });
    }
}
