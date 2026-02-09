package com.dattebayo.pos;

import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import androidx.appcompat.app.AppCompatActivity;

public class MainActivity extends AppCompatActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        // New Order
        findViewById(R.id.btnNewOrder).setOnClickListener(v -> {
            startActivity(new Intent(MainActivity.this, OrderActivity.class));
        });

        // Active Orders
        findViewById(R.id.btnActiveOrders).setOnClickListener(v -> {
            startActivity(new Intent(MainActivity.this, ActiveOrdersActivity.class));
        });

        // Menu
        findViewById(R.id.btnMenu).setOnClickListener(v -> {
            startActivity(new Intent(MainActivity.this, MenuActivity.class));
        });

        // Kitchen
        findViewById(R.id.btnKitchen).setOnClickListener(v -> {
            startActivity(new Intent(MainActivity.this, KitchenActivity.class));
        });

        // History
        findViewById(R.id.btnHistory).setOnClickListener(v -> {
            startActivity(new Intent(MainActivity.this, OrderHistoryActivity.class));
        });

        // Sales Summary
        findViewById(R.id.btnSalesSummary).setOnClickListener(v -> {
            startActivity(new Intent(MainActivity.this, SalesSummaryActivity.class));
        });
    }
}
