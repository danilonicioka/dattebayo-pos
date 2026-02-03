package com.dattebayo.pos;

import android.os.Bundle;
import android.widget.TextView;
import androidx.appcompat.app.AppCompatActivity;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;
import com.dattebayo.pos.client.model.HealthStatus;

public class MainActivity extends AppCompatActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        TextView textView = new TextView(this);
        textView.setText("Connecting to backend...");
        textView.setTextSize(24);
        setContentView(textView);

        DattebayoApplication app = (DattebayoApplication) getApplication();
        app.getApi().healthCheck().enqueue(new Callback<HealthStatus>() {
            @Override
            public void onResponse(Call<HealthStatus> call, Response<HealthStatus> response) {
                if (response.isSuccessful() && response.body() != null) {
                    textView.setText("Backend Status: " + response.body().getStatus());
                } else {
                    textView.setText("Backend Error: " + response.code());
                }
            }

            @Override
            public void onFailure(Call<HealthStatus> call, Throwable t) {
                textView.setText("Connection Failed: " + t.getMessage());
            }
        });
    }
}
