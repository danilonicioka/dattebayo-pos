'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingCart, ChefHat, ClipboardList, BarChart3, Settings } from 'lucide-react';
import './Sidebar.css';

export default function Sidebar() {
    const pathname = usePathname();

    const navItems = [
        { name: 'Caixa', path: '/', icon: ShoppingCart },
        { name: 'Cozinha', path: '/kitchen', icon: ChefHat },
        { name: 'Pedidos', path: '/orders', icon: ClipboardList },
        { name: 'Relatórios', path: '/admin/summary', icon: BarChart3 },
        { name: 'Gerenciamento', path: '/admin/products/edit', icon: Settings },
    ];

    return (
        <aside className="sidebar">
            <div className="sidebar-header">
                <h1 className="brand-title">Dattebayo</h1>
                <span className="brand-subtitle">Gestão V2</span>
            </div>

            <nav className="sidebar-nav">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.path || (item.path !== '/' && pathname.startsWith(item.path));

                    return (
                        <Link
                            key={item.path}
                            href={item.path}
                            className={`nav-link ${isActive ? 'active' : ''}`}
                        >
                            <Icon size={20} className="nav-icon" />
                            <span>{item.name}</span>
                        </Link>
                    );
                })}
            </nav>

            <div className="sidebar-footer">
                <div className="user-profile">
                    <div className="avatar">D</div>
                    <div className="user-info">
                        <span className="user-name">Admin</span>
                        <span className="user-role">Caixa Aberto</span>
                    </div>
                </div>
            </div>
        </aside>
    );
}
