'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingCart, Clock, ClipboardList, Settings, DollarSign } from 'lucide-react';
import './BottomNav.css';

export default function BottomNav() {
    const pathname = usePathname();

    const isAdminPath = pathname.startsWith('/admin');

    const mainItems = [
        { name: 'Cardápio', path: '/', icon: ShoppingCart },
        { name: 'Pedidos', path: '/orders', icon: Clock },
        { name: 'Cozinha', path: '/kitchen', icon: ClipboardList },
    ];

    const adminItems = [
        { name: 'Gerenciamento', path: '/admin/products/edit', icon: Settings },
        { name: 'Caixa', path: '/admin/summary', icon: DollarSign },
    ];

    const navItems = isAdminPath ? adminItems : mainItems;

    return (
        <nav className="bottom-nav">
            {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.path || (item.path !== '/' && pathname.startsWith(item.path));

                return (
                    <Link
                        key={item.path}
                        href={item.path}
                        className={`bottom-nav-link ${isActive ? 'active' : ''}`}
                    >
                        <Icon size={22} className="bottom-nav-icon" />
                        <span>{item.name}</span>
                    </Link>
                );
            })}
        </nav>
    );
}
