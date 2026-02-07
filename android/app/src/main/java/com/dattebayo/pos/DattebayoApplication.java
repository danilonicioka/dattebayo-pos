package com.dattebayo.pos;

import android.app.Application;
import retrofit2.Retrofit;
import retrofit2.converter.gson.GsonConverterFactory;
import com.dattebayo.pos.client.api.DefaultApi;

public class DattebayoApplication extends Application {
    private DefaultApi api;

    @Override
    public void onCreate() {
        super.onCreate();
        
        // 10.0.2.2 is the special alias to host loopback interface (i.e., localhost)
        Retrofit retrofit = new Retrofit.Builder()
                .baseUrl("http://10.0.2.2:8080/") 
                .addConverterFactory(GsonConverterFactory.create())
                .build();
                
        api = retrofit.create(DefaultApi.class);
    }
    
    public DefaultApi getApi() {
        return api;
    }
}
