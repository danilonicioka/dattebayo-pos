package com.dattebayo.pos;

import android.content.DialogInterface;
import android.os.Bundle;
import android.text.InputType;
import android.util.Log;
import android.widget.Button;
import android.widget.EditText;
import android.widget.TextView;
import android.widget.Toast;
import androidx.appcompat.app.AlertDialog;
import androidx.appcompat.app.AppCompatActivity;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.dattebayo.pos.api.ApiService;
import com.dattebayo.pos.api.RetrofitClient;
import com.dattebayo.pos.model.CreateOrderRequest;
import com.dattebayo.pos.model.MenuItem;
import com.dattebayo.pos.model.Order;
import com.dattebayo.pos.model.OrderItemRequest;
import com.dattebayo.pos.model.OrderItemVariationRequest;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

import java.util.ArrayList;
import java.util.List;

public class OrderActivity extends AppCompatActivity {

    private RecyclerView rvMenuSelection;
    private MenuSelectionAdapter adapter;
    private EditText etTableNumber, etNotes;
    private TextView tvCartSummary;
    private Button btnSubmitOrder;

    private List<OrderItemRequest> cart = new ArrayList<>();
    private double currentTotal = 0.0;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_order);

        etTableNumber = findViewById(R.id.etTableNumber);
        etNotes = findViewById(R.id.etNotes);
        tvCartSummary = findViewById(R.id.tvCartSummary);
        btnSubmitOrder = findViewById(R.id.btnSubmitOrder);
        rvMenuSelection = findViewById(R.id.rvMenuSelection);

        rvMenuSelection.setLayoutManager(new LinearLayoutManager(this));
        adapter = new MenuSelectionAdapter(new ArrayList<>(), this::showAddDialog);
        rvMenuSelection.setAdapter(adapter);

        loadMenu();

        btnSubmitOrder.setOnClickListener(v -> submitOrder());
    }

    private void loadMenu() {
        ApiService apiService = RetrofitClient.getApiService();
        apiService.getAvailableMenu().enqueue(new Callback<List<MenuItem>>() {
            @Override
            public void onResponse(Call<List<MenuItem>> call, Response<List<MenuItem>> response) {
                if (response.isSuccessful() && response.body() != null) {
                    adapter.updateData(response.body());
                } else {
                    Toast.makeText(OrderActivity.this, "Failed to load menu", Toast.LENGTH_SHORT).show();
                }
            }

            @Override
            public void onFailure(Call<List<MenuItem>> call, Throwable t) {
                Toast.makeText(OrderActivity.this, "Error: " + t.getMessage(), Toast.LENGTH_SHORT).show();
            }
        });
    }

    private void showAddDialog(MenuItem item) {
        AlertDialog.Builder builder = new AlertDialog.Builder(this);
        builder.setTitle(item.getName());

        final EditText input = new EditText(this);
        input.inputType = InputType.TYPE_CLASS_NUMBER;
        input.setHint("Quantity (default 1)");
        input.setText("1");
        builder.setView(input);

        builder.setPositiveButton("Add", (dialog, which) -> {
            String qtyStr = input.getText().toString();
            int qty = 1;
            try {
                qty = Integer.parseInt(qtyStr);
            } catch (NumberFormatException e) {
                qty = 1;
            }
            if (qty > 0) {
                addToCart(item, qty);
            }
        });

        builder.setNegativeButton("Cancel", (dialog, which) -> dialog.cancel());
        builder.show();
    }

    private void addToCart(MenuItem item, int quantity) {
        // Simplified: No variations support for now in this quick implementation
        List<OrderItemVariationRequest> variations = new ArrayList<>();
        
        OrderItemRequest orderItem = new OrderItemRequest(item.getId(), quantity, "", variations);
        cart.add(orderItem);

        currentTotal += item.getPrice() * quantity;
        updateCartSummary();
    }

    private void updateCartSummary() {
        tvCartSummary.setText(cart.size() + " items | $" + String.format("%.2f", currentTotal));
    }

    private void submitOrder() {
        String tableNum = etTableNumber.getText().toString();
        if (tableNum.isEmpty()) {
            Toast.makeText(this, "Please enter table number", Toast.LENGTH_SHORT).show();
            return;
        }
        if (cart.isEmpty()) {
            Toast.makeText(this, "Cart is empty", Toast.LENGTH_SHORT).show();
            return;
        }

        CreateOrderRequest request = new CreateOrderRequest(tableNum, cart, etNotes.getText().toString());
        
        ApiService apiService = RetrofitClient.getApiService();
        apiService.createOrder(request).enqueue(new Callback<Order>() {
            @Override
            public void onResponse(Call<Order> call, Response<Order> response) {
                if (response.isSuccessful()) {
                    Toast.makeText(OrderActivity.this, "Order Created!", Toast.LENGTH_LONG).show();
                    finish();
                } else {
                    Toast.makeText(OrderActivity.this, "Failed to create order: " + response.code(), Toast.LENGTH_LONG).show();
                }
            }

            @Override
            public void onFailure(Call<Order> call, Throwable t) {
                Toast.makeText(OrderActivity.this, "Error: " + t.getMessage(), Toast.LENGTH_LONG).show();
            }
        });
    }
}
