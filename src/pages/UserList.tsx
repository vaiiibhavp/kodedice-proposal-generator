import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Trash2, ChevronLeft, ChevronRight, Edit } from "lucide-react";
import { Input } from "@/components/ui/input";
import { getUserListAPI, updateUser, deleteUser } from "@/services/auth_service";
import { toast } from "sonner";

export default function UserList() {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);

    const usersPerPage = 10;

    const [isEditOpen, setIsEditOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<any>(null);

    const [editForm, setEditForm] = useState({
        fName: "",
        lName: "",
    });

    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [deleteUserId, setDeleteUserId] = useState<string | null>(null);


    const handleUpdate = async () => {
        if (!selectedUser) return;

        try {
            await updateUser({
                userId: selectedUser.id,
                fName: editForm.fName,
                lName: editForm.lName,
            });

            toast.success("User Updated Successfully ✅");
            setIsEditOpen(false);
            fetchUsers();
        } catch (err: any) {
            const message =
                err?.response?.data?.msg || err?.response?.data?.message || "Failed to update user";
            toast.error(message);
        }
    };

    const handleDelete = async () => {
        if (!deleteUserId) return;

        try {
            await deleteUser({ userId: deleteUserId });
            toast.success("User Deleted Successfully 🗑️");
            fetchUsers();
            setIsDeleteOpen(false);
        } catch (err: any) {
            const message =
                err?.response?.data?.msg || err?.response?.data?.message || "Failed to delete user";
            toast.error(message);
        }
    };

    //✅ Fetch users
    const fetchUsers = async () => {
        try {
            const res = await getUserListAPI(1, 1000);
            console.log("API RESPONSE:", res.data);
            // ✅ IMPORTANT FIX
            setUsers(res.data); // <-- use data array only
        } catch (error) {
            console.error("Failed to fetch users:", error);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const filteredUsers = users.filter((user) =>
        `${user.fName || ""} ${user.lName || ""} ${user.email || ""}`
            .toLowerCase()
            .includes(search.toLowerCase())
    );

    const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
    const startIndex = (currentPage - 1) * usersPerPage;
    const paginatedUsers = filteredUsers.slice(
        startIndex,
        startIndex + usersPerPage
    );

    return (
        <div className="p-4 md:p-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3 mb-4">
                <h2 className="text-xl font-semibold">
                    All Users ({filteredUsers.length})
                </h2>
                <Button onClick={() => navigate("/user-list/create-user")}>
                    + Add User
                </Button>
            </div>

            {/* Search */}
            <div className="mb-4">
                <Input
                    placeholder="Search user..."
                    value={search}
                    onChange={(e) => {
                        setSearch(e.target.value);
                        setCurrentPage(1);
                    }}
                    className="w-full md:max-w-sm"
                />
            </div>

            {/* Card Table */}
            <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
                {/* Table Head (hidden on mobile) */}
                <div className="hidden md:grid grid-cols-4 px-6 py-3 text-sm font-medium text-muted-foreground border-b">
                    <span>First Name</span>
                    <span>Last Name</span>
                    <span>Email</span>
                    <span className="text-center">Actions</span>
                </div>

                {/* Table Body */}
                {paginatedUsers.map((user) => (
                    <div
                        key={user.id}
                        className="flex flex-col md:grid md:grid-cols-4 px-4 md:px-6 py-4 text-sm border-b last:border-none hover:bg-gray-50 gap-2"
                    >
                        {/* First Name */}
                        <div>
                            <span className="md:hidden text-xs text-gray-500">First Name</span>
                            <span className="block">{user.fName}</span>
                        </div>

                        {/* Last Name */}
                        <div>
                            <span className="md:hidden text-xs text-gray-500">Last Name</span>
                            <span className="block">{user.lName}</span>
                        </div>

                        {/* Email */}
                        <div>
                            <span className="md:hidden text-xs text-gray-500">Email</span>
                            <span className="block break-all">{user.email}</span>
                        </div>

                        {/* Actions */}
                        <div className="flex justify-start md:justify-center items-center gap-6 pt-2 md:pt-0">
                            <Edit
                                className="w-4 h-4 cursor-pointer hover:text-black"
                                onClick={() => {
                                    setSelectedUser(user);
                                    setEditForm({ fName: user.fName, lName: user.lName });
                                    setIsEditOpen(true);
                                }}
                            />
                            <Trash2
                                className="w-4 h-4 cursor-pointer text-red-500 hover:text-red-700"
                                // onClick={() => handleDelete(user.id)}
                                onClick={() => {
                                    setDeleteUserId(user.id);
                                    setIsDeleteOpen(true);
                                }}
                            />
                        </div>
                    </div>
                ))}

                {paginatedUsers.length === 0 && (
                    <p className="text-center py-6 text-gray-500">No users found</p>
                )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-center items-center gap-3 mt-4 flex-wrap">
                    <Button
                        variant="outline"
                        size="icon"
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage((p) => p - 1)}
                    >
                        <ChevronLeft size={18} />
                    </Button>

                    <span className="text-sm">
                        Page {currentPage} of {totalPages}
                    </span>

                    <Button
                        variant="outline"
                        size="icon"
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage((p) => p + 1)}
                    >
                        <ChevronRight size={18} />
                    </Button>
                </div>
            )}
            {/* ✅ EDIT MODAL — paste here */}
            {isEditOpen && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md space-y-4">
                        <h3 className="text-lg font-semibold">Edit User</h3>

                        <div className="space-y-2">
                            <label>First Name:</label>
                            <Input
                                value={editForm.fName}
                                onChange={(e) =>
                                    setEditForm({ ...editForm, fName: e.target.value })
                                }
                            />
                        </div>

                        <div className="space-y-2">
                            <label>Last Name:</label>
                            <Input
                                value={editForm.lName}
                                onChange={(e) =>
                                    setEditForm({ ...editForm, lName: e.target.value })
                                }
                            />
                        </div>

                        <div className="flex justify-end gap-2 pt-4">
                            <Button variant="outline" onClick={() => setIsEditOpen(false)}>
                                Cancel
                            </Button>
                            <Button onClick={handleUpdate}>Update</Button>
                        </div>
                    </div>
                </div>


            )}

            {isDeleteOpen && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-md space-y-4">

                        <h3 className="text-lg font-semibold flex items-center gap-2 text-red-600">
                            Delete User
                        </h3>

                        <p className="text-sm font-semibold text-gray-600">
                            Are you sure you want to delete this user?
                        </p>

                        <div className="flex justify-end gap-3 pt-4">
                            <Button
                                variant="outline"
                                onClick={() => setIsDeleteOpen(false)}
                            >
                                Cancel
                            </Button>

                            <Button
                                className="bg-red-500 hover:bg-red-600 text-white"
                                onClick={handleDelete}
                            >
                                Delete
                            </Button>
                        </div>

                    </div>
                </div>
            )}

        </div>
    );
}
