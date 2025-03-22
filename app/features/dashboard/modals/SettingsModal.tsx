'use client'

import { useState, useRef, useEffect } from 'react'
import { useSettingsStore } from '@/store/useSettingsStore'
import { useUIStore } from '@/store/useUIStore'
import Modal from '@/app/components/modals/Modal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { X, Plus, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export default function SettingsModal() {
  const [newInstrument, setNewInstrument] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { isSettingsModalOpen, closeSettingsModal } = useUIStore()
  const { instruments, addInstrument, removeInstrument, loadInstruments } = useSettingsStore()
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isSettingsModalOpen) {
      loadInstruments().catch(error => {
        console.error('Failed to load instruments:', error);
        toast.error('Failed to load instruments');
      });
    }
  }, [isSettingsModalOpen, loadInstruments]);

  const handleAddInstrument = async () => {
    if (newInstrument.trim()) {
      setIsLoading(true);
      try {
        await addInstrument(newInstrument.trim());
        setNewInstrument('');
        toast.success('Instrument added successfully');
      } catch (error) {
        console.error('Failed to add instrument:', error);
        toast.error('Failed to add instrument');
      } finally {
        setIsLoading(false);
      }
    }
  }

  const handleRemoveInstrument = async (instrument: string) => {
    setIsLoading(true);
    try {
      await removeInstrument(instrument);
      toast.success('Instrument removed successfully');
    } catch (error) {
      console.error('Failed to remove instrument:', error);
      toast.error('Failed to remove instrument');
    } finally {
      setIsLoading(false);
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddInstrument();
    }
  }

  const handleClose = () => {
    closeSettingsModal();
  }

  const handleExportData = async () => {
    try {
      const response = await fetch('/api/export');
      if (!response.ok) {
        throw new Error('Failed to export data');
      }
      const data = await response.json();
      
      // Create and download file
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `student-progress-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success('Data exported successfully');
    } catch (error) {
      console.error('Failed to export data:', error);
      toast.error('Failed to export data');
    }
  }

  const handleImportData = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const data = JSON.parse(text);
      
      const response = await fetch('/api/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        throw new Error('Failed to import data');
      }
      
      await loadInstruments();
      toast.success('Data imported successfully');
    } catch (error) {
      console.error('Failed to import data:', error);
      toast.error('Failed to import data');
    }
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }

  return (
    <Modal 
      isOpen={isSettingsModalOpen}
      onClose={handleClose}
      title="Settings"
    >
      <div className="space-y-8 py-2">
        {/* Instruments Section */}
        <div className="space-y-4">
          <div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              Instruments
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
              Add or remove instruments that you teach
            </p>
          </div>
          
          <div className="space-y-4">
            <div className="flex gap-3">
              <Input
                type="text"
                placeholder="Add new instrument"
                value={newInstrument}
                onChange={(e) => setNewInstrument(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isLoading}
                className="flex-1 text-gray-900 dark:text-white placeholder:text-gray-500"
              />
              <Button 
                onClick={handleAddInstrument}
                disabled={isLoading || !newInstrument.trim()}
                className="gap-2 bg-primary hover:bg-primary/90"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
                Add
              </Button>
            </div>
            
            <Card className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
              <ScrollArea className="h-[240px]">
                <div className="p-4 space-y-2">
                  {instruments.length === 0 ? (
                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                      No instruments added yet. Add your first instrument above.
                    </p>
                  ) : (
                    instruments.map((instrument) => (
                      <div
                        key={instrument}
                        className="flex items-center justify-between rounded-md border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 p-3 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                      >
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{instrument}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveInstrument(instrument)}
                          disabled={isLoading}
                          className="h-8 w-8 text-gray-600 dark:text-gray-300 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900 dark:hover:text-red-400"
                        >
                          {isLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <X className="h-4 w-4" />
                          )}
                          <span className="sr-only">Remove {instrument}</span>
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </Card>
          </div>
        </div>

        <Separator className="my-6 bg-gray-200 dark:bg-gray-700" />

        {/* Data Management Section */}
        <div className="space-y-4">
          <div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              Data Management
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
              Export or import your data for backup
            </p>
          </div>
          
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleExportData}
              disabled={isLoading}
              className="flex-1 font-medium text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              Export Data
            </Button>
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading}
              className="flex-1 font-medium text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              Import Data
            </Button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImportData}
              accept="application/json"
              className="hidden"
            />
          </div>
        </div>
        
        <Separator className="my-6 bg-gray-200 dark:bg-gray-700" />
        
        <div className="flex justify-end">
          <Button 
            onClick={handleClose}
            size="lg"
            disabled={isLoading}
            className="font-medium px-8 bg-primary hover:bg-primary/90"
          >
            Close
          </Button>
        </div>
      </div>
    </Modal>
  )
} 