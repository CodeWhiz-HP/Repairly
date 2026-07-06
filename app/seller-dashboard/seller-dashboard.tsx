'use client'

import { useMemo, useState } from "react";
import { Button } from "@/components/Button";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ChevronDown, X } from "lucide-react";
import { acceptRepairRequest, rejectRepairRequest } from "@/actions/repairRequest";
import { updateOrderStatus as updateOrderStatusAction, updateOrderEstimatedCompletionDate, cancelRepairOrder } from "@/actions/repairOrder";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { RepairRequest as FrontendRepairRequest, Order as FrontendOrder } from "@/types/types";

type DashboardActionMode = 'request' | 'status';
type DashboardSection = 'incoming' | 'active' | 'completed';

const statusOptions = [
    'placed',
    'accepted',
    'pickup_scheduled',
    'picked_up',
    'repairing',
    'qa_check',
    'ready_return',
    'out_for_delivery',
    'delivered',
    'completed',
] as const;

const statusOrder = new Map(statusOptions.map((status, index) => [status, index] as const));

const dashboardSections: Array<{ value: DashboardSection; label: string }> = [
    { value: 'incoming', label: 'Incoming Repair Requests' },
    { value: 'active', label: 'Active Jobs' },
    { value: 'completed', label: 'Completed Jobs' },
];

interface Props {
    repairRequests: FrontendRepairRequest[];
    repairOrders: FrontendOrder[];
    dashboardStats: any;
    revenueData: any;
}

const SellerDashboard = ({
    repairRequests,
    repairOrders,
    dashboardStats,
    revenueData,
}: Props) => {
    const router = useRouter();
    const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
    const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
    const [actionMode, setActionMode] = useState<DashboardActionMode>('status');
    const [dashboardSection, setDashboardSection] = useState<DashboardSection>('incoming');
    const [orders, setOrders] = useState(repairOrders);
    const [pendingRequests, setPendingRequests] = useState(repairRequests)
    const [proposedPrice, setProposedPrice] = useState<number | "">("");
    const [estimatedCompletionDate, setEstimatedCompletionDate] = useState<string>("");

    const data = revenueData;

    const activeRequest = useMemo(
        () => pendingRequests.find((request) => request.id === selectedRequestId) || null,
        [pendingRequests, selectedRequestId]
    );

    const activeOrder = useMemo(
        () => orders.find((order) => order.id === selectedOrderId) || null,
        [orders, selectedOrderId]
    );

    const incomingRequests = pendingRequests.filter((request) => request.status === 'pending');
    const activeJobs = orders.filter((order) => order.status !== 'completed' && order.status !== 'delivered');
    const completedJobs = orders.filter((order) => order.status === 'completed' || order.status === 'delivered');

    const openRequestModal = (requestId: string) => {
        setSelectedRequestId(requestId);
        setSelectedOrderId(null);
        setActionMode('request');
        const req = pendingRequests.find((r) => r.id === requestId);
        if (req) {
            setProposedPrice(req.estimatedBudget);
        } else {
            setProposedPrice("");
        }
        const defaultDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        setEstimatedCompletionDate(defaultDate);
    };

    const openStatusModal = (orderId: string) => {
        setSelectedOrderId(orderId);
        setSelectedRequestId(null);
        setActionMode('status');
        const order = orders.find((o) => o.id === orderId);
        if (order && order.estimatedCompletionDate) {
            setEstimatedCompletionDate(new Date(order.estimatedCompletionDate).toISOString().split('T')[0]);
        } else {
            setEstimatedCompletionDate("");
        }
    };

    const closeModal = () => {
        setSelectedOrderId(null);
        setSelectedRequestId(null);
    };

    const acceptRequest = async () => {
        if (!activeRequest) return;
        const req = await acceptRepairRequest(
            activeRequest.id,
            proposedPrice !== "" ? Number(proposedPrice) : undefined,
            estimatedCompletionDate
        );
        if (req.success) {
            toast.success("Order Accepted Successfully.", { duration: 2000 });
            setPendingRequests((current) =>
                current.filter((r) => r.id !== activeRequest.id)
            );
            if (req.order) {
                setOrders((current) => [req.order, ...current]);
            }
            router.refresh();
        } else {
            toast.error(req.message || "There was some issue on our side.", { duration: 2000 });
        }
        closeModal();
    };

    const rejectRequest = async () => {
        if (!activeRequest) return;
        const req = await rejectRepairRequest(activeRequest.id);
        if (req.success) {
            toast.success("Order Rejected Successfully.", { duration: 2000 });
            setPendingRequests((current) =>
                current.filter((r) => r.id !== activeRequest.id)
            );
            router.refresh();
        } else {
            toast.error(req.message || "There was some issue on our side.", { duration: 2000 });
        }
        closeModal();
    };

    const updateOrderStatus = async (newStatus: (typeof statusOptions)[number]) => {
        if (!activeOrder) return;
        const req = await updateOrderStatusAction(activeOrder.id, newStatus);
        if (req.success) {
            toast.success("Order status updated successfully.", { duration: 2000 });
            setOrders((current) =>
                current.map((order) =>
                    order.id === activeOrder.id ? { ...order, status: newStatus } : order
                )
            );
            router.refresh();
        } else {
            toast.error(req.message || "Failed to update order status.", { duration: 2000 });
        }
        closeModal();
    };

    const updateOrderCompletionDate = async () => {
        if (!activeOrder) return;
        const res = await updateOrderEstimatedCompletionDate(activeOrder.id, estimatedCompletionDate);
        if (res.success && res.order) {
            toast.success("Estimated completion date updated successfully.");
            setOrders((current) =>
                current.map((order) =>
                    order.id === activeOrder.id ? { ...order, estimatedCompletionDate: res.order.estimatedCompletionDate } : order
                )
            );
            router.refresh();
        } else {
            toast.error(res.message || "Failed to update estimated completion date.");
        }
        closeModal();
    };

    const handleCancelOrder = async (orderId: string) => {
        if (!confirm("Are you sure you want to cancel this order?")) return;
        const res = await cancelRepairOrder(orderId);
        if (res.success) {
            toast.success("Order cancelled successfully.");
            setOrders((current) => current.filter((o) => o.id !== orderId));
            router.refresh();
        } else {
            toast.error(res.message || "Failed to cancel order.");
        }
    };

    const currentOrderStatusIndex = activeOrder ? statusOrder.get(activeOrder.status) ?? -1 : -1;
    const availableStatusOptions = statusOptions.filter((status) => (statusOrder.get(status) ?? -1) > currentOrderStatusIndex);

    const sectionItems =
        dashboardSection === 'incoming'
            ? incomingRequests
            : dashboardSection === 'active'
                ? activeJobs
                : completedJobs;

    return (
        <div className="mx-auto max-w-7xl px-4 py-10 relative">
            <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                    <h2 className="text-3xl font-display font-bold text-white">Technician Dashboard</h2>
                    <p className="mt-2 text-softGray">Manage requests, track jobs, and review your performance from one place.</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <div className="relative">
                        <select
                            value={dashboardSection}
                            onChange={(event) => setDashboardSection(event.target.value as DashboardSection)}
                            className="min-w-[230px] appearance-none rounded-lg border border-slateSteel bg-gunmetal px-4 py-3 pr-10 text-sm text-white outline-none transition-colors focus:border-electricAqua"
                        >
                            {dashboardSections.map((section) => (
                                <option key={section.value} value={section.value}>
                                    {section.label}
                                </option>
                            ))}
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-softGray" />
                    </div>
                    <Button>Update Availability</Button>
                </div>
            </div>

            <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-4">
                {[
                    { label: 'Active Repairs', val: (dashboardStats?.activeRepairs ?? 0).toString(), color: 'text-electricAqua' },
                    { label: 'Weekly Revenue', val: `$${(dashboardStats?.totalRevenue ?? 0).toLocaleString()}`, color: 'text-cyberGreen' },
                    { label: 'Avg Rating', val: (dashboardStats?.averageRating ?? 0).toFixed(1), color: 'text-warningYellow' },
                    { label: 'Completion Rate', val: `${dashboardStats?.completionRate ?? 0}%`, color: 'text-white' }
                ].map((stat, i) => (
                    <div key={i} className="rounded-lg border border-slateSteel bg-gunmetal p-6">
                        <div className="mb-1 text-sm text-softGray">{stat.label}</div>
                        <div className={`text-3xl font-bold ${stat.color}`}>{stat.val}</div>
                    </div>
                ))}
            </div>

            <div className="grid gap-8 lg:grid-cols-[minmax(0,1.7fr)_minmax(320px,0.9fr)]">
                <div className="space-y-6">
                    <div className="rounded-2xl border border-slateSteel bg-gunmetal p-6 shadow-[0_0_40px_rgba(0,0,0,0.18)]">
                        <div className="mb-4 flex items-center justify-between gap-3">
                            <div>
                                <h3 className="text-xl font-bold text-white">{dashboardSections.find((section) => section.value === dashboardSection)?.label}</h3>
                                <p className="text-sm text-softGray">
                                    {dashboardSection === 'incoming'
                                        ? 'Review and triage new customer repair requests.'
                                        : dashboardSection === 'active'
                                            ? 'Monitor jobs currently in progress.'
                                            : 'Archived jobs that are delivered or completed.'}
                                </p>
                            </div>
                            <div className="rounded-full border border-slateSteel bg-deepCarbon px-3 py-1 text-xs uppercase tracking-[0.2em] text-softGray">
                                {sectionItems.length} items
                            </div>
                        </div>

                        <div className="space-y-4">
                            {dashboardSection === 'incoming' && incomingRequests.map((request) => (
                                <div key={request.id} className="flex flex-col gap-4 rounded-xl border border-slateSteel bg-deepCarbon p-4 md:flex-row md:items-center md:justify-between">
                                    <div>
                                        <div className="font-bold text-white">{request.customerName}</div>
                                        <div className="text-sm text-softGray">{request.deviceModel}</div>
                                        <div className="mt-1 line-clamp-2 text-sm text-softGray">{request.issueDescription}</div>
                                        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                                            <span className="rounded border border-slateSteel bg-gunmetal px-2 py-1 uppercase text-electricAqua">{request.status}</span>
                                            <span className="text-softGray">Budget: ${request.estimatedBudget}</span>
                                            <span className="text-softGray">Requested: {new Date(request.requestedDate).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 md:flex-col">
                                        <Button size="sm" variant="outline" onClick={() => openRequestModal(request.id)}>Review</Button>
                                    </div>
                                </div>
                            ))}

                            {dashboardSection === 'active' && activeJobs.map((order) => (
                                <div key={order.id} className="flex flex-col gap-4 rounded-xl border border-slateSteel bg-deepCarbon p-4 md:flex-row md:items-center md:justify-between">
                                    <div>
                                        <div className="font-bold text-white">{order.deviceModel}</div>
                                        <div className="text-sm text-softGray">{order.issueDescription}</div>
                                        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                                            <span className="rounded border border-slateSteel bg-gunmetal px-2 py-1 uppercase text-electricAqua">{order.status}</span>
                                            <span className="text-softGray">Due: {new Date(order.estimatedCompletionDate).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 md:flex-col">
                                        <Button size="sm" variant="outline" onClick={() => openStatusModal(order.id)}>Update Status</Button>
                                        {['placed', 'accepted', 'pickup_scheduled'].includes(order.status) && (
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => handleCancelOrder(order.id)}
                                                className="text-errorRed border-errorRed/30 hover:bg-errorRed/10 hover:text-errorRed"
                                            >
                                                Cancel Job
                                            </Button>
                                        )}
                                        {order.status === 'repairing' && (
                                            <Button size="sm" variant="secondary">Upload Report</Button>
                                        )}
                                    </div>
                                </div>
                            ))}

                            {dashboardSection === 'completed' && completedJobs.map((order) => (
                                <div key={order.id} className="flex flex-col gap-4 rounded-xl border border-slateSteel bg-deepCarbon p-4 md:flex-row md:items-center md:justify-between">
                                    <div>
                                        <div className="font-bold text-white">{order.deviceModel}</div>
                                        <div className="text-sm text-softGray">{order.issueDescription}</div>
                                        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                                            <span className="rounded border border-slateSteel bg-gunmetal px-2 py-1 uppercase text-cyberGreen">{order.status}</span>
                                            <span className="text-softGray">Completed: {new Date(order.estimatedCompletionDate).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 md:flex-col">
                                        {order.repairReportUrl && <Button size="sm" variant="outline">View Report</Button>}
                                        <Button size="sm" variant="secondary" onClick={() => openStatusModal(order.id)}>Update Status</Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="rounded-2xl border border-slateSteel bg-gunmetal p-6 shadow-[0_0_40px_rgba(0,0,0,0.18)]">
                        <h3 className="mb-4 text-xl font-bold text-white">Revenue Analytics</h3>
                        <div className="h-56 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={data}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                    <XAxis dataKey="name" stroke="#9CA3AF" />
                                    <YAxis stroke="#9CA3AF" />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#0B0F10', borderColor: '#374151', color: '#fff' }}
                                        itemStyle={{ color: '#26FFF2' }}
                                    />
                                    <Line type="monotone" dataKey="revenue" stroke="#26FFF2" strokeWidth={2} activeDot={{ r: 8 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-slateSteel bg-gunmetal p-6">
                        <h4 className="mb-4 text-lg font-bold text-white">Today at a Glance</h4>
                        <div className="space-y-3 text-sm text-softGray">
                            <div className="flex items-center justify-between">
                                <span>Incoming Requests</span>
                                <span className="text-white">{incomingRequests.length}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span>Active Jobs</span>
                                <span className="text-white">{activeJobs.length}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span>Completed Jobs</span>
                                <span className="text-white">{completedJobs.length}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {(activeRequest || activeOrder) && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
                    <div className="w-full max-w-lg rounded-2xl border border-slateSteel bg-gunmetal shadow-[0_0_40px_rgba(0,0,0,0.45)]">
                        <div className="flex items-center justify-between border-b border-slateSteel px-6 py-4">
                            <div>
                                <h3 className="text-lg font-bold text-white">
                                    {actionMode === 'request' ? 'Repair Request Review' : 'Update Order Status'}
                                </h3>
                                <p className="text-sm text-softGray">
                                    {actionMode === 'request' ? 'Accept or reject the incoming request' : 'Change the current repair stage'}
                                </p>
                            </div>
                            <button onClick={closeModal} className="text-softGray transition-colors hover:text-white">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="space-y-4 px-6 py-5">
                            {activeRequest && actionMode === 'request' && (
                                <>
                                    <div className="space-y-2 rounded-lg border border-slateSteel bg-deepCarbon p-4 text-sm text-softGray">
                                        <div><span className="text-white">Customer:</span> {activeRequest.customerName}</div>
                                        <div><span className="text-white">Email:</span> {activeRequest.customerEmail}</div>
                                        <div><span className="text-white">Device:</span> {activeRequest.deviceModel}</div>
                                        <div><span className="text-white">Issue:</span> {activeRequest.issueDescription}</div>
                                        <div><span className="text-white">Budget:</span> ${activeRequest.estimatedBudget}</div>
                                    </div>

                                    <div className="space-y-1">
                                        <label className="block text-xs font-semibold text-softGray uppercase">Proposed Quote Price ($)</label>
                                        <input
                                            type="number"
                                            value={proposedPrice}
                                            onChange={(e) => setProposedPrice(e.target.value === "" ? "" : Number(e.target.value))}
                                            placeholder={`Default: $${activeRequest.estimatedBudget}`}
                                            className="w-full rounded-lg border border-slateSteel bg-deepCarbon px-3 py-2 text-white outline-none focus:border-electricAqua"
                                        />
                                    </div>

                                    <div className="space-y-1">
                                        <label className="block text-xs font-semibold text-softGray uppercase">Estimated Completion Date</label>
                                        <input
                                            type="date"
                                            value={estimatedCompletionDate}
                                            onChange={(e) => setEstimatedCompletionDate(e.target.value)}
                                            className="w-full rounded-lg border border-slateSteel bg-deepCarbon px-3 py-2 text-white outline-none focus:border-electricAqua"
                                        />
                                    </div>

                                    <div className="flex flex-col gap-3 sm:flex-row pt-2">
                                        <Button variant="outline" className="flex-1" onClick={rejectRequest}>Reject</Button>
                                        <Button className="flex-1" onClick={acceptRequest}>Accept</Button>
                                    </div>
                                </>
                            )}

                            {activeOrder && actionMode === 'status' && (
                                <>
                                    <div className="space-y-2 rounded-lg border border-slateSteel bg-deepCarbon p-4 text-sm text-softGray">
                                        <div><span className="text-white">Device:</span> {activeOrder.deviceModel}</div>
                                        <div><span className="text-white">Issue:</span> {activeOrder.issueDescription}</div>
                                        <div><span className="text-white">Current Status:</span> {activeOrder.status}</div>
                                    </div>

                                    <div className="space-y-1.5 border-t border-slateSteel/50 pt-4">
                                        <label className="block text-xs font-semibold text-softGray uppercase">Estimated Completion Date</label>
                                        <div className="flex gap-2">
                                            <input
                                                type="date"
                                                value={estimatedCompletionDate}
                                                onChange={(e) => setEstimatedCompletionDate(e.target.value)}
                                                className="flex-1 rounded-lg border border-slateSteel bg-deepCarbon px-3 py-2 text-white outline-none focus:border-electricAqua"
                                            />
                                            <Button variant="outline" size="sm" onClick={updateOrderCompletionDate}>Update Date</Button>
                                        </div>
                                    </div>

                                    <div className="space-y-1.5 border-t border-slateSteel/50 pt-4">
                                        <label className="block text-xs font-semibold text-softGray uppercase">Update Workflow Stage</label>
                                        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                                            {availableStatusOptions.map((status) => (
                                                <button
                                                    key={status}
                                                    type="button"
                                                    onClick={() => updateOrderStatus(status)}
                                                    className="rounded-lg border border-slateSteel bg-deepCarbon px-3 py-2 text-sm text-softGray transition-colors hover:border-electricAqua hover:text-white"
                                                >
                                                    {status.replaceAll('_', ' ')}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default SellerDashboard