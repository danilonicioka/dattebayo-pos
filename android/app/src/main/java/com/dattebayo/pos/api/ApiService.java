package com.dattebayo.pos.api;

import com.dattebayo.pos.model.CreateOrderRequest;
import com.dattebayo.pos.model.MenuItem;
import com.dattebayo.pos.model.Order;

import java.util.List;
import java.util.Map;

import retrofit2.Call;
import retrofit2.http.Body;
import retrofit2.http.GET;
import retrofit2.http.POST;
import retrofit2.http.PUT;
import retrofit2.http.Path;
import retrofit2.http.Query;

public interface ApiService {

    // Menu Endpoints
    @GET("api/menu/available")
    Call<List<MenuItem>> getAvailableMenu();

    @GET("api/menu")
    Call<List<MenuItem>> getAllMenu();

    @GET("api/menu/{id}")
    Call<MenuItem> getMenuItem(@Path("id") Long id);

    // Order Endpoints
    @POST("api/orders")
    Call<Order> createOrder(@Body CreateOrderRequest request);

    @GET("api/orders")
    Call<List<Order>> getAllOrders();

    @GET("api/orders/kitchen")
    Call<List<Order>> getKitchenOrders();

    @GET("api/orders/{id}")
    Call<Order> getOrder(@Path("id") Long id);

    @PUT("api/orders/{id}/status")
    Call<Order> updateOrderStatus(@Path("id") Long id, @Query("status") String status);
}
