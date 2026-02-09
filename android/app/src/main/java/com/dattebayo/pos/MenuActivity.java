package com.dattebayo.pos;

import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.widget.ProgressBar;
import android.widget.TextView;
import androidx.appcompat.app.AppCompatActivity;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;
import com.dattebayo.pos.api.ApiService;
import com.dattebayo.pos.api.RetrofitClient;
import com.dattebayo.pos.model.MenuItem;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;
import java.util.ArrayList;
import java.util.List;

public class MenuActivity extends AppCompatActivity {

    private RecyclerView recyclerView;
    private MenuAdapter adapter;
    private ProgressBar progressBar;
    private TextView tvError;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_menu);

        recyclerView = findViewById(R.id.recyclerView);
        progressBar = findViewById(R.id.progressBar);
        tvError = findViewById(R.id.tvError);
        
        findViewById(R.id.fabAdd).setOnClickListener(v -> {
            startActivity(new android.content.Intent(MenuActivity.this, AddEditMenuActivity.class));
        });

        recyclerView.setLayoutManager(new LinearLayoutManager(this));
        adapter = new MenuAdapter(new ArrayList<>(), item -> {
            android.content.Intent intent = new android.content.Intent(MenuActivity.this, AddEditMenuActivity.class);
            intent.putExtra(AddEditMenuActivity.EXTRA_MENU_ITEM_ID, item.getId());
            startActivity(intent);
        });
        recyclerView.setAdapter(adapter);
    }

    @Override
    protected void onResume() {
        super.onResume();
        loadMenu();
    }

    private void loadMenu() {
        ApiService apiService = RetrofitClient.getApiService();
        Call<List<MenuItem>> call = apiService.getAllMenu();

        call.enqueue(new Callback<List<MenuItem>>() {
            @Override
            public void onResponse(Call<List<MenuItem>> call, Response<List<MenuItem>> response) {
                progressBar.setVisibility(View.GONE);
                if (response.isSuccessful() && response.body() != null) {
                    adapter.updateData(response.body());
                } else {
                    showError();
                }
            }

            @Override
            public void onFailure(Call<List<MenuItem>> call, Throwable t) {
                progressBar.setVisibility(View.GONE);
                showError();
                Log.e("MenuActivity", "Error loading menu", t);
            }
        });
    }

    private void showError() {
        tvError.setVisibility(View.VISIBLE);
    }
}
