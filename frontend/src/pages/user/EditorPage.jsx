import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useVersionStore } from '@/store/useVersionStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useToast } from '@/components/ToastProvider';
import VersionSidebar from '@/components/VersionSidebar';
import TextEditor from '@/components/TextEditor';
import { Button } from '@/components/ui/button';
import { LogOut, ChevronLeft, Save } from 'lucide-react';

const EditorPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { user, logout } = useAuthStore();
  const { 
    currentDocument, 
    currentContent, 
    loadDocumentAndVersions, 
    saveNewVersion, 
    previewVersionId,
    loading,
    saving,
    error,
    renameDocument,
  } = useVersionStore();

  const [localContent, setLocalContent] = useState("");
  const [localTitle, setLocalTitle] = useState("");
  const [commitMessage, setCommitMessage] = useState("");

  useEffect(() => {
    if (id) {
      loadDocumentAndVersions(id);
    }
  }, [id, loadDocumentAndVersions]);

  useEffect(() => {
    // When currentContent from store changes (e.g. from loading or selecting a version in sidebar),
    // update our local state to pass to the editor
    setLocalContent(currentContent);
  }, [currentContent]);

  useEffect(() => {
    if (currentDocument) {
      setLocalTitle(currentDocument.title);
    }
  }, [currentDocument]);

  const handleLogout = () => {
    logout();
    navigate('/signin');
  };

  const handleSave = async () => {
    try {
      const liveEditorHtml = document.querySelector(".ProseMirror")?.innerHTML?.trim();
      const contentToSave = liveEditorHtml || localContent || currentContent || "<p></p>";
      setLocalContent(contentToSave);
      const result = await saveNewVersion(id, contentToSave, commitMessage);
      if (result?.saved) {
        setCommitMessage("");
        toast.success("Version saved successfully!");
      } else {
        toast.info(result?.message || "No changes detected.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to save version.");
    }
  };

  const handleTitleChange = (e) => {
    setLocalTitle(e.target.value);
  };

  const handleTitleSave = async () => {
    if (localTitle.trim() !== currentDocument.title) {
      await renameDocument(id, localTitle.trim() || "Untitled Document");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-700 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading document...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md">
          <div className="text-gray-700 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Failed to Load Document</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => navigate('/dashboard')} variant="outline">
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  if (!currentDocument) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md">
          <div className="text-gray-400 text-6xl mb-4">📄</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Document Not Found</h2>
          <p className="text-gray-600 mb-4">The document you're looking for doesn't exist or you don't have permission to view it.</p>
          <Button onClick={() => navigate('/dashboard')} variant="outline">
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  // Check if we are viewing an old version
  const isPreviewingOldVersion = previewVersionId !== null;

  return (
    <div className="flex flex-col h-screen bg-gray-100 font-sans overflow-hidden">
      {/* Top Navbar */}
      <nav className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200 shrink-0">
        <div className="flex items-center gap-4">
         <div className="flex items-center gap-2 font-bold text-lg text-gray-900">
        <div className="grid grid-cols-2 gap-0.5">
          <div className="w-2 h-2 rounded-full bg-gray-500" />
          <div className="w-2 h-2 rounded-full bg-gray-800" />
          <div className="w-2 h-2 rounded-full bg-gray-800" />
          <div className="w-2 h-2 rounded-full bg-gray-800" />
        </div>
        Kodoc
      </div>
          
          <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')} className="text-gray-600 hover:text-gray-900 -ml-2">
            <ChevronLeft className="w-4 h-4 mr-1" /> My Documents
          </Button>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-gray-600 hidden sm:inline-block">
            Welcome, {user?.username || 'User'}
          </span>
          <Button variant="ghost" size="sm" onClick={handleLogout} className="text-gray-600 hover:text-gray-900">
            <LogOut className="w-4 h-4 mr-2" /> Logout
          </Button>
        </div>
      </nav>

      {/* Main Layout Area */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* Left Sidebar: Version History */}
        <VersionSidebar documentId={id} />

        {/* Right Area: Editor */}
        <div className="flex-1 flex flex-col p-4 sm:p-6 overflow-hidden">
          
          {/* Editor Header: Title and Save Action */}
          <div className="flex items-center justify-between mb-4 shrink-0">
            <div>
              <input 
                type="text" 
                value={localTitle}
                onChange={handleTitleChange}
                onBlur={handleTitleSave}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.currentTarget.blur();
                  }
                }}
                className="text-2xl font-bold text-gray-800 bg-transparent border-none outline-none focus:ring-2 focus:ring-gray-300 rounded px-1 -ml-1 transition-all hover:bg-gray-200/50"
                placeholder="Untitled Document"
              />
              {isPreviewingOldVersion && (
                <div className="mt-1">
                  <span className="inline-block text-xs font-semibold text-gray-700 bg-gray-200 px-2 py-1 rounded">
                    Viewing Old Version (Read Only)
                  </span>
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-3">
              {!isPreviewingOldVersion && (
                <>
                  <input
                    type="text"
                    value={commitMessage}
                    onChange={(e) => setCommitMessage(e.target.value)}
                    maxLength={240}
                    placeholder="Commit message (optional)"
                    className="w-72 h-9 rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300"
                  />
                  <Button 
                    onClick={handleSave} 
                    disabled={saving}
                    className="bg-gray-900 hover:bg-gray-800 text-white shadow-sm"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {saving ? 'Saving...' : 'Commit Version'}
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Tiptap Editor */}
          <div className="flex-1 overflow-hidden rounded-lg shadow-sm">
             <TextEditor 
               initialContent={currentContent}
               onChange={(html) => setLocalContent(html)}
               readOnly={isPreviewingOldVersion}
             />
          </div>

        </div>
      </div>
    </div>
  );
};

export default EditorPage;
