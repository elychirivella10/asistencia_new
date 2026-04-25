"use client";

import { useEffect, useState, useMemo } from "react";
import { getAreaTreeAction } from "../actions/area-read.action";
import { AreaNode } from "./AreaNode";
import { Loader2, Network, ChevronRight, Home, ArrowLeft } from "lucide-react";
import { AREA_CONFIG } from "../config/area.constants";
import { Button } from "@/components/ui/button";

export function AreaOrganigramView({ dialogState }) {
  const [tree, setTree] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [navigationPath, setNavigationPath] = useState([]);

  const LABELS = AREA_CONFIG.UI.LABELS.ORGANIGRAM;

  const {
    handleEdit,
    handleAddSubArea,
    setDeletingArea
  } = dialogState;

  useEffect(() => {
    async function loadTree() {
      try {
        setIsLoading(true);
        const data = await getAreaTreeAction();
        if (data && data.success !== false) {
           setTree(Array.isArray(data) ? data : (data.data || []));
        } else {
           setTree([]);
        }
      } catch (error) {
        console.error("Error loading organigram:", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadTree();
  }, []);

  const currentRoot = useMemo(() => {
    return navigationPath.length > 0 ? navigationPath[navigationPath.length - 1] : null;
  }, [navigationPath]);

  const visibleChildren = useMemo(() => {
    return currentRoot ? (currentRoot.children || []) : tree;
  }, [currentRoot, tree]);

  const handleDrillDown = (area) => {
    setNavigationPath((prev) => [...prev, area]);
  };

  const handleGoBack = () => {
    setNavigationPath((prev) => prev.slice(0, -1));
  };

  const handleJumpToPath = (index) => {
    setNavigationPath((prev) => prev.slice(0, index + 1));
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-muted-foreground animate-pulse">Cargando estructura organizacional...</p>
      </div>
    );
  }

  if (tree.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed rounded-xl border-muted-foreground/20">
        <Network className="w-16 h-16 text-muted-foreground/30 mb-4" />
        <p className="text-xl font-medium text-muted-foreground">{LABELS.EMPTY_STATE}</p>
        <p className="text-sm text-muted-foreground/60">{LABELS.EMPTY_STATE_SUB}</p>
      </div>
    );
  }

  return (
    <div className="relative bg-gradient-to-br from-background to-secondary/20 rounded-2xl border shadow-inner min-h-[600px] flex flex-col overflow-hidden">
      
      {/* Header & Breadcrumbs */}
      <div className="sticky top-0 z-50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 bg-background/95 backdrop-blur border-b shadow-sm">
        <div className="flex items-center flex-wrap gap-2 text-sm">
          <button 
            onClick={() => setNavigationPath([])}
            className="flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors font-medium px-2 py-1 rounded-md hover:bg-primary/5"
          >
            <Home className="w-4 h-4" />
            {LABELS.BREADCRUMB_HOME}
          </button>
          
          {navigationPath.map((node, idx) => (
            <div key={node.id} className="flex items-center gap-2">
              <ChevronRight className="w-4 h-4 text-muted-foreground/50 shrink-0" />
              <button
                onClick={() => handleJumpToPath(idx)}
                className={`truncate max-w-[150px] md:max-w-[200px] px-2 py-1 rounded-md transition-colors ${
                  idx === navigationPath.length - 1 
                    ? "text-foreground font-semibold bg-secondary/50 pointer-events-none" 
                    : "text-muted-foreground hover:text-primary hover:bg-primary/5 font-medium"
                }`}
                title={node.nombre}
              >
                {node.nombre}
              </button>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {navigationPath.length > 0 && (
            <Button variant="outline" size="sm" onClick={handleGoBack} className="h-8 gap-2 text-xs">
              <ArrowLeft className="w-3.5 h-3.5" />
              {LABELS.GO_BACK}
            </Button>
          )}
          <div className="flex items-center gap-2 text-xs font-medium text-primary bg-primary/10 px-3 py-1.5 rounded-full border border-primary/20">
            <Network className="w-3.5 h-3.5" />
            {LABELS.ACTIVE_VIEW}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 w-full overflow-y-auto overflow-x-hidden p-6 md:p-8 relative custom-scrollbar">
        <div className="max-w-6xl mx-auto space-y-8 pb-12">
          
          {/* Current Root Area Highlight */}
          {currentRoot && (
            <div className="animate-in fade-in slide-in-from-top-4 duration-500 ease-out flex flex-col items-center">
               <div className="w-full max-w-xl">
                 <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 text-center">
                    {LABELS.ROOT_TITLE}
                 </h4>
                 <AreaNode
                   area={currentRoot}
                   onEdit={handleEdit}
                   onAddSubArea={handleAddSubArea}
                   onDelete={setDeletingArea}
                   isRoot={true}
                 />
               </div>
               
               {/* Visual connector */}
               {visibleChildren.length > 0 && (
                 <div className="w-px h-10 bg-border mt-4 relative">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-border rounded-full" />
                 </div>
               )}
            </div>
          )}

          {/* Children Grid */}
          <div key={currentRoot?.id || 'root'} className="animate-in fade-in slide-in-from-bottom-8 duration-500 ease-out">
            {currentRoot && visibleChildren.length > 0 && (
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4 text-center">
                {LABELS.DEPENDENCIES_TITLE}
              </h4>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {visibleChildren.map((child) => (
                <AreaNode
                  key={child.id}
                  area={child}
                  onEdit={handleEdit}
                  onAddSubArea={handleAddSubArea}
                  onDelete={setDeletingArea}
                  onDrillDown={handleDrillDown}
                  isRoot={false}
                />
              ))}
            </div>
          </div>

        </div>
      </div>
      
    </div>
  );
}
