package com.dattebayo.pos;

import android.content.Context;
import android.content.res.ColorStateList;
import android.graphics.Color;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.TextView;
import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;
import com.dattebayo.pos.model.Order;
import com.dattebayo.pos.model.OrderItem;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

public class ActiveOrderAdapter extends RecyclerView.Adapter<ActiveOrderAdapter.ViewHolder> {

    private List<Order> orders = new ArrayList<>();
    private OnOrderActionListener listener;
    private SimpleDateFormat timeFormat = new SimpleDateFormat("HH:mm", Locale.getDefault());

    public interface OnOrderActionListener {
        void onEdit(Order order);
        void onCancel(Order order);
        void onPay(Order order);
    }

    public void setOnOrderActionListener(OnOrderActionListener listener) {
        this.listener = listener;
    }

    public void setOrders(List<Order> orders) {
        this.orders = orders;
        notifyDataSetChanged();
    }

    @NonNull
    @Override
    public ViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext()).inflate(R.layout.item_active_order, parent, false);
        return new ViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull ViewHolder holder, int position) {
        Order order = orders.get(position);
        Context context = holder.itemView.getContext();

        holder.tvTableNumber.setText("Mesa " + order.getTableNumber());
        // For simplicity, using a hardcoded or empty string if date is not properly parsed yet as Order has String createdAt
        holder.tvTime.setText(order.getCreatedAt() != null ? order.getCreatedAt() : "");
        holder.tvTotal.setText(String.format("$%.2f", order.getTotal()));

        // Status Styling
        String statusText;
        int statusColor;
        String status = order.getStatus() != null ? order.getStatus() : "";
        switch (status) {
            case "PENDING":
                statusText = "PENDENTE";
                statusColor = Color.parseColor("#FFC107"); // Amber
                break;
            case "PREPARING":
                statusText = "PREPARANDO";
                statusColor = Color.parseColor("#FF9800"); // Orange
                break;
            case "READY":
                statusText = "PRONTO";
                statusColor = Color.parseColor("#4CAF50"); // Green
                break;
            default:
                statusText = status;
                statusColor = Color.GRAY;
        }
        holder.tvStatus.setText(statusText);
        holder.tvStatus.setBackgroundTintList(ColorStateList.valueOf(statusColor));

        // Items List
        StringBuilder itemsText = new StringBuilder();
        if (order.getItems() != null) {
            for (OrderItem item : order.getItems()) {
                itemsText.append(item.getQuantity()).append("x ").append(item.getMenuItemName()).append("\n");
            }
        }
        holder.tvItems.setText(itemsText.toString().trim());

        // Buttons
        holder.btnEdit.setOnClickListener(v -> {
            if (listener != null) listener.onEdit(order);
        });
        holder.btnCancel.setOnClickListener(v -> {
            if (listener != null) listener.onCancel(order);
        });
        holder.btnPay.setOnClickListener(v -> {
            if (listener != null) listener.onPay(order);
        });
    }

    @Override
    public int getItemCount() {
        return orders.size();
    }

    static class ViewHolder extends RecyclerView.ViewHolder {
        TextView tvTableNumber, tvStatus, tvTime, tvItems, tvTotal;
        Button btnEdit, btnCancel, btnPay;

        public ViewHolder(@NonNull View itemView) {
            super(itemView);
            tvTableNumber = itemView.findViewById(R.id.tvTableNumber);
            tvStatus = itemView.findViewById(R.id.tvStatus);
            tvTime = itemView.findViewById(R.id.tvTime);
            tvItems = itemView.findViewById(R.id.tvItems);
            tvTotal = itemView.findViewById(R.id.tvTotal);
            btnEdit = itemView.findViewById(R.id.btnEdit);
            btnCancel = itemView.findViewById(R.id.btnCancel);
            btnPay = itemView.findViewById(R.id.btnPay);
        }
    }
}
