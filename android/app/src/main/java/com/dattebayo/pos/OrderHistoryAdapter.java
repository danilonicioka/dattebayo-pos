package com.dattebayo.pos;

import android.graphics.Color;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;
import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;
import com.dattebayo.pos.model.Order;
import com.dattebayo.pos.model.OrderItem;
import java.util.List;

public class OrderHistoryAdapter extends RecyclerView.Adapter<OrderHistoryAdapter.OrderViewHolder> {

    private List<Order> orders;

    public OrderHistoryAdapter(List<Order> orders) {
        this.orders = orders;
    }

    public void updateData(List<Order> newOrders) {
        this.orders = newOrders;
        notifyDataSetChanged();
    }

    @NonNull
    @Override
    public OrderViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext()).inflate(R.layout.item_history_order, parent, false);
        return new OrderViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull OrderViewHolder holder, int position) {
        Order order = orders.get(position);
        holder.tvTableNumber.setText("Table " + order.getTableNumber());
        holder.tvStatus.setText(order.getStatus());
        holder.tvDate.setText(order.getCreatedAt().toString().substring(0, 16).replace("T", " ")); // Simple formatting
        holder.tvTotal.setText("Total: $" + String.format("%.2f", order.getTotal()));
        
        StringBuilder itemsBuilder = new StringBuilder();
        if (order.getItems() != null) {
            for (OrderItem item : order.getItems()) {
                itemsBuilder.append(item.getQuantity()).append("x ").append(item.getMenuItemName()).append("\n");
            }
        }
        holder.tvOrderItems.setText(itemsBuilder.toString().trim());
        
        // Status styling
        if ("COMPLETED".equals(order.getStatus())) {
            holder.tvStatus.setTextColor(Color.parseColor("#223c0e")); // Green
             // Could update background drawable tint programmatically if needed
        } else {
             holder.tvStatus.setTextColor(Color.parseColor("#dc3545")); // Red
        }
    }

    @Override
    public int getItemCount() {
        return orders != null ? orders.size() : 0;
    }

    static class OrderViewHolder extends RecyclerView.ViewHolder {
        TextView tvTableNumber, tvStatus, tvOrderItems, tvDate, tvTotal;

        public OrderViewHolder(@NonNull View itemView) {
            super(itemView);
            tvTableNumber = itemView.findViewById(R.id.tvTableNumber);
            tvStatus = itemView.findViewById(R.id.tvStatus);
            tvOrderItems = itemView.findViewById(R.id.tvOrderItems);
            tvDate = itemView.findViewById(R.id.tvDate);
            tvTotal = itemView.findViewById(R.id.tvTotal);
        }
    }
}
