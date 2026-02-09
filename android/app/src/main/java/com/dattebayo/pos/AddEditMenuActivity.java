package com.dattebayo.pos;

import android.os.Bundle;
import android.view.View;
import android.widget.Button;
import android.widget.CheckBox;
import android.widget.EditText;
import android.widget.Toast;
import androidx.appcompat.app.AppCompatActivity;

import com.dattebayo.pos.api.ApiService;
import com.dattebayo.pos.api.RetrofitClient;
import com.dattebayo.pos.model.MenuItem;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class AddEditMenuActivity extends AppCompatActivity {

    public static final String EXTRA_MENU_ITEM_ID = "com.dattebayo.pos.EXTRA_MENU_ITEM_ID";

    private EditText etName;
    private EditText etDescription;
    private EditText etPrice;
    private EditText etCategory;
    private CheckBox cbAvailable;
    private Button btnSave;
    private Button btnDelete;

    private Long menuItemId;
    private MenuItem currentItem;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_add_edit_menu);

        etName = findViewById(R.id.etName);
        etDescription = findViewById(R.id.etDescription);
        etPrice = findViewById(R.id.etPrice);
        etCategory = findViewById(R.id.etCategory);
        cbAvailable = findViewById(R.id.cbAvailable);
        btnSave = findViewById(R.id.btnSave);
        btnDelete = findViewById(R.id.btnDelete);

        if (getIntent().hasExtra(EXTRA_MENU_ITEM_ID)) {
            menuItemId = getIntent().getLongExtra(EXTRA_MENU_ITEM_ID, -1);
            setTitle("Edit Menu Item");
            btnDelete.setVisibility(View.VISIBLE);
            loadMenuItem(menuItemId);
        } else {
            setTitle("Add Menu Item");
            btnDelete.setVisibility(View.GONE);
        }

        btnSave.setOnClickListener(v -> saveMenuItem());
        btnDelete.setOnClickListener(v -> deleteMenuItem());
    }

    private void loadMenuItem(Long id) {
        ApiService apiService = RetrofitClient.getApiService();
        apiService.getMenuItem(id).enqueue(new Callback<MenuItem>() {
            @Override
            public void onResponse(Call<MenuItem> call, Response<MenuItem> response) {
                if (response.isSuccessful() && response.body() != null) {
                    currentItem = response.body();
                    populateFields(currentItem);
                } else {
                    Toast.makeText(AddEditMenuActivity.this, "Failed to load item", Toast.LENGTH_SHORT).show();
                    finish();
                }
            }

            @Override
            public void onFailure(Call<MenuItem> call, Throwable t) {
                Toast.makeText(AddEditMenuActivity.this, "Error: " + t.getMessage(), Toast.LENGTH_SHORT).show();
                finish();
            }
        });
    }

    private void populateFields(MenuItem item) {
        etName.setText(item.getName());
        etDescription.setText(item.getDescription());
        etPrice.setText(String.valueOf(item.getPrice()));
        etCategory.setText(item.getCategory());
        cbAvailable.setChecked(item.getAvailable() != null ? item.getAvailable() : false);
    }

    private void saveMenuItem() {
        String name = etName.getText().toString().trim();
        String description = etDescription.getText().toString().trim();
        String priceStr = etPrice.getText().toString().trim();
        String category = etCategory.getText().toString().trim();
        boolean available = cbAvailable.isChecked();

        if (name.isEmpty() || priceStr.isEmpty() || category.isEmpty()) {
            Toast.makeText(this, "Please fill required fields", Toast.LENGTH_SHORT).show();
            return;
        }

        double price;
        try {
            price = Double.parseDouble(priceStr);
        } catch (NumberFormatException e) {
            Toast.makeText(this, "Invalid price", Toast.LENGTH_SHORT).show();
            return;
        }

        MenuItem item = new MenuItem();
        item.setName(name);
        item.setDescription(description);
        item.setPrice(price);
        item.setCategory(category);
        item.setAvailable(available);

        ApiService apiService = RetrofitClient.getApiService();
        Call<MenuItem> call;

        if (menuItemId != null) {
            item.setId(menuItemId); // Ensure ID is set for update, though usually path param is enough, good for consistency
            call = apiService.updateMenuItem(menuItemId, item);
        } else {
            call = apiService.createMenuItem(item);
        }

        call.enqueue(new Callback<MenuItem>() {
            @Override
            public void onResponse(Call<MenuItem> call, Response<MenuItem> response) {
                if (response.isSuccessful()) {
                    Toast.makeText(AddEditMenuActivity.this, "Saved!", Toast.LENGTH_SHORT).show();
                    finish();
                } else {
                    Toast.makeText(AddEditMenuActivity.this, "Failed to save: " + response.code(), Toast.LENGTH_SHORT).show();
                }
            }

            @Override
            public void onFailure(Call<MenuItem> call, Throwable t) {
                Toast.makeText(AddEditMenuActivity.this, "Error: " + t.getMessage(), Toast.LENGTH_SHORT).show();
            }
        });
    }

    private void deleteMenuItem() {
        if (menuItemId == null) return;

        ApiService apiService = RetrofitClient.getApiService();
        apiService.deleteMenuItem(menuItemId).enqueue(new Callback<Void>() {
            @Override
            public void onResponse(Call<Void> call, Response<Void> response) {
                if (response.isSuccessful()) {
                    Toast.makeText(AddEditMenuActivity.this, "Deleted!", Toast.LENGTH_SHORT).show();
                    finish();
                } else {
                    Toast.makeText(AddEditMenuActivity.this, "Failed to delete: " + response.code(), Toast.LENGTH_SHORT).show();
                }
            }

            @Override
            public void onFailure(Call<Void> call, Throwable t) {
                Toast.makeText(AddEditMenuActivity.this, "Error: " + t.getMessage(), Toast.LENGTH_SHORT).show();
            }
        });
    }
}
