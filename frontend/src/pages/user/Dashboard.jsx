import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FileText,
  File,
  Plus,
  Search,
  Home,
  Menu,
  X,
  LogOut,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useDocumentStore } from "@/store/useDocumentStore";
import { useAuthStore } from "@/store/useAuthStore";
import { useToast } from "@/components/ToastProvider";
import { Clock } from "lucide-react";
const Dashboard = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { documents, loading, loadDocuments, createDocument, deleteDocument } =
    useDocumentStore();
  const { user, logout } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  const handleCreateNew = async () => {
    try {
      const result = await createDocument("Untitled Document");
      if (result?.document?._id) {
        navigate(`/editor/${result.document._id}`);
        toast.success("New document created!");
      } else {
        toast.error("Failed to create document");
      }
    } catch (err) {
      console.error("Failed to create document", err);
      toast.error("Failed to create document");
    }
  };

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    navigate("/signin");
  };

  const handleDeleteDocument = async (documentId, documentTitle, event) => {
    // Prevent the card click from triggering
    event.stopPropagation();

    if (
      window.confirm(
        `Are you sure you want to delete "${documentTitle}"? This action cannot be undone.`,
      )
    ) {
      try {
        await deleteDocument(documentId);
        toast.success("Document deleted successfully");
      } catch (err) {
        console.error("Failed to delete document", err);
        toast.error("Failed to delete document");
      }
    }
  };

  const filteredDocuments = documents;

  const sidebarItems = [{ icon: Home, label: "Dashboard", active: false }];

  return (
    <div className="min-h-screen flex flex-row bg-gradient-to-br from-gray-100 via-gray-100 to-gray-200/60">
      {/* Sidebar */}
      <div
        className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white/95 backdrop-blur-xl border-r border-gray-200/80 shadow-xl transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        lg:relative lg:translate-x-0 lg:w-64 lg:flex-shrink-0
      `}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <div className="flex items-center gap-2 font-bold text-lg text-gray-900">
              <div className="grid grid-cols-2 gap-0.5">
                <div className="w-2 h-2 rounded-full bg-gray-500" />
                <div className="w-2 h-2 rounded-full bg-gray-800" />
                <div className="w-2 h-2 rounded-full bg-gray-800" />
                <div className="w-2 h-2 rounded-full bg-gray-800" />
              </div>
              Kodoc
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6">
            <ul className="space-y-2">
              {sidebarItems.map((item, index) => (
                <li key={index}>
                  <button
                    className={`
                    w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200
                    ${
                      item.active
                        ? "bg-gray-200 text-gray-900 border border-gray-300 shadow-sm"
                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                    }
                  `}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          {/* User section */}
          <div className="p-4 border-t border-gray-100">
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-100">
                <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center text-white text-sm font-bold">
                  {user?.username?.charAt(0)?.toUpperCase() || "U"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {user?.username || "User"}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {user?.email || "user@example.com"}
                  </p>
                </div>
              </div>
              <Button
                onClick={handleLogout}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300 flex items-center justify-center gap-2 rounded-xl transition-colors"
                variant="ghost"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 w-full overflow-hidden">
        <div className="p-6 lg:p-8 max-h-screen overflow-y-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Dashboard
                </h1>
                <p className="text-gray-600">
                  Welcome back! Here's what's happening with your documents.
                </p>
              </div>
              <Button
                onClick={handleCreateNew}
                className="bg-gray-900 hover:bg-gray-800 text-white shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2 px-6 py-3 rounded-xl"
                disabled={loading}
              >
                <Plus className="w-5 h-5" />
                New Document
              </Button>
            </div>

            {/* Search */}
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search documents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white/80 backdrop-blur-sm border-gray-200/80 rounded-xl shadow-sm focus:ring-2 focus:ring-gray-400/30 focus:border-gray-500"
              />
            </div>
          </div>

          {/* Stats Cards */}
          {/* <div className="grid grid-cols-1 max-w-md">
            {stats.map((stat, index) => (
              <Card key={index} className="bg-white/80 backdrop-blur-sm border-slate-200/60 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                      <stat.icon className={`w-6 h-6 ${stat.color}`} />
                    </div>
                    <span className="text-sm font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                      {stat.trend}
                    </span>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-900 mb-1">{stat.value}</p>
                    <p className="text-sm text-slate-600">{stat.title}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div> */}

          {/* Recent Documents */}
          <div className="bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Recent Documents
              </h2>
              <Button
                variant="ghost"
                className="text-gray-600 hover:text-gray-900"
              >
                View All
              </Button>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {[...Array(8)].map((_, i) => (
                  <div
                    key={i}
                    className="h-48 bg-gray-100 rounded-xl animate-pulse"
                  />
                ))}
              </div>
            ) : filteredDocuments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-gray-500">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <FileText className="w-8 h-8 text-gray-300" />
                </div>
                <h3 className="text-lg font-medium mb-2">No documents found</h3>
                <p className="text-center text-gray-400 mb-6 max-w-sm">
                  {searchTerm
                    ? "Try adjusting your search terms"
                    : "Create your first document to get started"}
                </p>
                <Button
                  onClick={handleCreateNew}
                  className="bg-gray-900 hover:bg-gray-800 text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Document
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredDocuments.slice(0, 8).map((doc) => (
                  <Card
                    key={doc._id}
                    className="group cursor-pointer hover:shadow-xl transition-all duration-300 border-gray-200/60 hover:border-gray-400/70 bg-gradient-to-br from-white to-gray-50/50"
                    onClick={() => navigate(`/editor/${doc._id}`)}
                  >
                    <CardContent className="p-0">
                      {/* Document Preview */}
                      <div className="aspect-[4/3] bg-gradient-to-br from-gray-50 to-gray-100 border-b border-gray-200/60 flex items-center justify-center group-hover:from-gray-100 group-hover:to-gray-200 transition-colors duration-300 relative">
                        <div className="w-12 h-12 bg-white rounded-lg shadow-sm border border-gray-200 flex items-center justify-center">
                          <File className="w-6 h-6 text-gray-600" />
                        </div>
                        {/* Delete Button */}
                        <button
                          onClick={(e) =>
                            handleDeleteDocument(doc._id, doc.title, e)
                          }
                          className="absolute top-2 right-2 w-8 h-8 bg-gray-700 hover:bg-gray-900 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-lg"
                          title="Delete document"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Document Info */}
                      <div className="p-4">
                        <h3 className="font-semibold text-gray-900 mb-2 truncate group-hover:text-gray-700 transition-colors">
                          {doc.title}
                        </h3>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(doc.updatedAt).toLocaleDateString()}
                          </span>
                          <span className="px-2 py-1 bg-gray-100 rounded-full text-xs">
                            Document
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu Button */}
      <button
        onClick={() => setSidebarOpen(true)}
        className="fixed bottom-6 right-6 lg:hidden w-14 h-14 bg-gray-900 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center z-30"
      >
        <Menu className="w-6 h-6 text-white" />
      </button>
    </div>
  );
};

export default Dashboard;
