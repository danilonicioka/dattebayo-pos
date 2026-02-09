package com.dattebayo.pos;

import android.os.Bundle;
import android.text.InputType;
import android.util.Log;
import android.widget.Button;
import android.widget.EditText;
import android.widget.TextView;
import android.widget.Toast;
import androidx.appcompat.app.AlertDialog;
import androidx.appcompat.app.AppCompatActivity;
import androidx.recyclerview.widget.GridLayoutManager;
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
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

public class OrderActivity extends AppCompatActivity {

    private RecyclerView rvCategories;
    private RecyclerView rvMenuSelection;
    private MenuSelectionAdapter menuAdapter;
    private CategoryAdapter categoryAdapter;
    
    private EditText etTableNumber, etNotes;
    private TextView tvCartSummary;
    private Button btnSubmitOrder;

    private List<MenuItem> allMenuItems = new ArrayList<>();
    private List<OrderItemRequest> cart = new ArrayList<>();
    private double currentTotal = 0.0;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_order);

        etTableNumber = findViewById(R.id.etTableNumber);
        etNotes = findViewById(R.id.etNotes); // Although visibility is gone in XML for now
        tvCartSummary = findViewById(R.id.tvCartSummary);
        btnSubmitOrder = findViewById(R.id.btnSubmitOrder);
        
        rvCategories = findViewById(R.id.rvCategories);
        rvMenuSelection = findViewById(R.id.rvMenuSelection);

        // Setup Categories
        rvCategories.setLayoutManager(new LinearLayoutManager(this, LinearLayoutManager.HORIZONTAL, false));
        categoryAdapter = new CategoryAdapter(new ArrayList<>(), this::filterMenuByCategory);
        rvCategories.setAdapter(categoryAdapter);

        // Setup Menu Grid
        rvMenuSelection.setLayoutManager(new GridLayoutManager(this, 2));
        menuAdapter = new MenuSelectionAdapter(new ArrayList<>(), this::showAddDialog);
        rvMenuSelection.setAdapter(menuAdapter);

        btnSubmitOrder.setOnClickListener(v -> submitOrder());
        
        loadMenu();
    }

    private void loadMenu() {
        ApiService apiService = RetrofitClient.getApiService();
        apiService.getAvailableMenu().enqueue(new Callback<List<MenuItem>>() {
            @Override
            public void onResponse(Call<List<MenuItem>> call, Response<List<MenuItem>> response) {
                if (response.isSuccessful() && response.body() != null) {
                    allMenuItems = response.body();
                    setupCategories(allMenuItems);
                    menuAdapter.updateData(allMenuItems); // Show all initially
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

    private void setupCategories(List<MenuItem> items) {
        Set<String> categories = new HashSet<>();
        categories.add("All");
        for (MenuItem item : items) {
            if (item.getCategory() != null && !item.getCategory().isEmpty()) {
                categories.add(item.getCategory());
            }
        }
        // Simple sort or keep "All" first
        List<String> categoryList = new ArrayList<>(categories);
        categoryList.sort((c1, c2) -> {
            if (c1.equals("All")) return -1;
            if (c2.equals("All")) return 1;
            return c1.compareTo(c2);
        });
        categoryAdapter.setCategories(categoryList);
    }

    private void filterMenuByCategory(String category) {
        if (category.equals("All")) {
            menuAdapter.updateData(allMenuItems);
        } else {
            List<MenuItem> filtered = allMenuItems.stream()
                .filter(item -> category.equals(item.getCategory()))
                .collect(Collectors.toList());
            menuAdapter.updateData(filtered);
        }
    }

    private void showAddDialog(MenuItem item) {
        AlertDialog.Builder builder = new AlertDialog.Builder(this);
        builder.setTitle(item.getName());

        android.widget.LinearLayout layout = new android.widget.LinearLayout(this);
        layout.setOrientation(android.widget.LinearLayout.VERTICAL);
        layout.setPadding(32, 32, 32, 32);

        final EditText input = new EditText(this);
        input.setInputType(InputType.TYPE_CLASS_NUMBER);
        input.setHint("Quantity (default 1)");
        input.setText("1");
        layout.addView(input);

        List<android.widget.CheckBox> checkBoxes = new ArrayList<>();
        if (item.getVariations() != null && !item.getVariations().isEmpty()) {
            TextView tvVariations = new TextView(this);
            tvVariations.setText("Variations:");
            tvVariations.setPadding(0, 16, 0, 8);
            layout.addView(tvVariations);

            for (com.dattebayo.pos.model.MenuItemVariation var : item.getVariations()) {
                android.widget.CheckBox cb = new android.widget.CheckBox(this);
                cb.setText(var.getName() + " (+" + var.getAdditionalPrice() + ")");
                cb.setTag(var);
                layout.addView(cb);
                checkBoxes.add(cb);
            }
        }

        builder.setView(layout);

        builder.setPositiveButton("Add", (dialog, which) -> {
            String qtyStr = input.getText().toString();
            int qty = 1;
            try {
                qty = Integer.parseInt(qtyStr);
            } catch (NumberFormatException e) {
                qty = 1;
            }
            
            List<OrderItemVariationRequest> selectedVariations = new ArrayList<>();
            for (android.widget.CheckBox cb : checkBoxes) {
                if (cb.isChecked()) {
                    com.dattebayo.pos.model.MenuItemVariation var = (com.dattebayo.pos.model.MenuItemVariation) cb.getTag();
                    selectedVariations.add(new OrderItemVariationRequest(var.getId(), true, 1)); 
                }
            }

            if (qty > 0) {
                addToCart(item, qty, selectedVariations);
            }
        });

        builder.setNegativeButton("Cancel", (dialog, which) -> dialog.cancel());
        builder.show();
    }

    private void addToCart(MenuItem item, int quantity, List<OrderItemVariationRequest> variations) {
        OrderItemRequest orderItem = new OrderItemRequest(item.getId(), quantity, "", variations);
        cart.add(orderItem);

        double itemTotal = item.getPrice() * quantity;
        if (item.getVariations() != null) {
             for (OrderItemVariationRequest req : variations) {
                 for (com.dattebayo.pos.model.MenuItemVariation var : item.getVariations()) {
                     if (var.getId().equals(req.getMenuItemVariationId())) {
                         itemTotal += var.getAdditionalPrice() * quantity; 
                         break;
                     }
                 }
             }
        }

        currentTotal += itemTotal;
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

        CreateOrderRequest request = new CreateOrderRequest(tableNum, cart, ""); // Notes empty for now or use etNotes if made visible
        
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
