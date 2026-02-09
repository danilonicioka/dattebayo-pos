package com.dattebayo.pos;

import android.graphics.Color;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.TextView;
import androidx.annotation.NonNull;
import androidx.core.content.ContextCompat;
import androidx.recyclerview.widget.RecyclerView;
import com.dattebayo.pos.model.Order;
import com.dattebayo.pos.model.OrderItem;
import com.dattebayo.pos.model.OrderItemVariation;
import java.util.List;

public class OrderAdapter extends RecyclerView.Adapter<OrderAdapter.OrderViewHolder> {

    private List<Order> orders;
    private OnOrderActionListener listener;

    public interface OnOrderActionListener {
        void onAction(Order order);
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
        View view = LayoutInflater.from(parent.getContext()).inflate(R.layout.item_kitchen_order, parent, false);
        return new OrderViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull OrderViewHolder holder, int position) {
        Order order = orders.get(position);
        holder.tvOrderId.setText("Order #" + order.getId());
        holder.tvTableNumber.setText("Table " + order.getTableNumber());
        holder.tvStatus.setText(order.getStatus());
        
        // Time logic would go here if available in model directly as formatted string or timestamp
        // holder.tvOrderTime.setText(...); 

        // Styling based on status
        int statusColor;
        String actionText;
        int actionColor;
        
        switch (order.getStatus()) {
            case "PENDING":
                statusColor = Color.parseColor("#ebad1c"); // Yellowish
                actionText = "Start Preparing";
                actionColor = Color.parseColor("#ee8b1b");
                break;
            case "PREPARING":
                statusColor = Color.parseColor("#ee8b1b"); // Orange
                actionText = "Mark Ready";
                actionColor = Color.parseColor("#223c0e");
                break;
            case "READY":
                statusColor = Color.parseColor("#223c0e"); // Green
                actionText = "Complete";
                actionColor = Color.parseColor("#080502");
                break;
            default:
                statusColor = Color.GRAY;
                actionText = "View";
                actionColor = Color.GRAY;
        }

        holder.viewStatusBorder.setBackgroundColor(statusColor);
        holder.tvStatus.setBackgroundColor(statusColor);
        holder.btnAction.setText(actionText);
        holder.btnAction.setBackgroundColor(actionColor);

        StringBuilder itemsBuilder = new StringBuilder();
        if (order.getItems() != null) {
            for (OrderItem item : order.getItems()) {
                itemsBuilder.append(item.getQuantity()).append("x ").append(item.getMenuItemName());
                if(item.getVariations() != null && !item.getVariations().isEmpty()) {
                    itemsBuilder.append("\n   ");
                    for(OrderItemVariation var : item.getVariations()) {
                         // Assuming variation name is accessible via some way, or handled by backend DTO better
                         // itemsBuilder.append("+ ").append(var.getName()).append(" ");
                    }
                }
                itemsBuilder.append("\n");
            }
        }
        holder.tvOrderItems.setText(itemsBuilder.toString().trim());
        
        holder.btnAction.setOnClickListener(v -> {
            if (listener != null) {
                listener.onAction(order);
            }
        });
    }

    @Override
    public int getItemCount() {
        return orders != null ? orders.size() : 0;
    }

    static class OrderViewHolder extends RecyclerView.ViewHolder {
        TextView tvOrderId, tvTableNumber, tvStatus, tvOrderTime, tvOrderItems;
        View viewStatusBorder;
        Button btnAction;

        public OrderViewHolder(@NonNull View itemView) {
            super(itemView);
            tvOrderId = itemView.findViewById(R.id.tvOrderId);
            tvTableNumber = itemView.findViewById(R.id.tvTableNumber);
            tvStatus = itemView.findViewById(R.id.tvStatus);
            tvOrderTime = itemView.findViewById(R.id.tvOrderTime); // Helper for time
            tvOrderItems = itemView.findViewById(R.id.tvOrderItems);
            viewStatusBorder = itemView.findViewById(R.id.viewStatusBorder);
            btnAction = itemView.findViewById(R.id.btnAction);
        }
    }
}
