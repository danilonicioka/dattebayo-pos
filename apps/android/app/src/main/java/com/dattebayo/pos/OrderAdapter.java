package com.dattebayo.pos;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.TextView;
import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;
import com.dattebayo.pos.model.Order;
import com.dattebayo.pos.model.OrderItem;
import java.util.List;

public class OrderAdapter extends RecyclerView.Adapter<OrderAdapter.OrderViewHolder> {

    private List<Order> orders;
    private OnOrderActionListener listener;

    public interface OnOrderActionListener {
        void onMarkReady(Order order);
    }

    public OrderAdapter(List<Order> orders, OnOrderActionListener listener) {
        this.orders = orders;
        this.listener = listener;
    }

    public void updateData(List<Order> newOrders) {
        this.orders = newOrders;
        notifyDataSetChanged();
    }

    @NonNull
    @Override
    public OrderViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext()).inflate(R.layout.item_order, parent, false);
        return new OrderViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull OrderViewHolder holder, int position) {
        Order order = orders.get(position);
        holder.tvTableNumber.setText("Table " + order.getTableNumber());
        holder.tvStatus.setText(order.getStatus());
        
        StringBuilder itemsBuilder = new StringBuilder();
        if (order.getItems() != null) {
            for (OrderItem item : order.getItems()) {
                itemsBuilder.append(item.getQuantity()).append("x ").append(item.getMenuItemName()).append("\n");
            }
        }
        holder.tvOrderItems.setText(itemsBuilder.toString());
        
        holder.btnMarkReady.setOnClickListener(v -> {
            if (listener != null) {
                listener.onMarkReady(order);
            }
        });
    }

    @Override
    public int getItemCount() {
        return orders != null ? orders.size() : 0;
    }

    static class OrderViewHolder extends RecyclerView.ViewHolder {
        TextView tvTableNumber, tvStatus, tvOrderItems;
        Button btnMarkReady;

        public OrderViewHolder(@NonNull View itemView) {
            super(itemView);
            tvTableNumber = itemView.findViewById(R.id.tvTableNumber);
            tvStatus = itemView.findViewById(R.id.tvStatus);
            tvOrderItems = itemView.findViewById(R.id.tvOrderItems);
            btnMarkReady = itemView.findViewById(R.id.btnMarkReady);
        }
    }
}
