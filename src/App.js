import { useState } from "react";
import { Check, ChevronDown, FileText, Pen, X } from "lucide-react";
import { Button } from "/components/ui/button";
import { Card } from "/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "/components/ui/tabs";
import { Input } from "/components/ui/input";
import { Label } from "/components/ui/label";
import { Separator } from "/components/ui/separator";
import { Progress } from "/components/ui/progress";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "/components/ui/dropdown-menu";

export default function ESignatureApp() {
  const [documents, setDocuments] = useState([
    { id: 1, name: "Contract Agreement", status: "pending", dateReceived: "2023-11-15" },
    { id: 2, name: "NDA Document", status: "signed", dateReceived: "2023-11-10" },
    { id: 3, name: "Service Proposal", status: "pending", dateReceived: "2023-11-18" }
  ]);
  
  const [activeDocument, setActiveDocument] = useState(null);
  const [signature, setSignature] = useState("");
  const [signatureType, setSignatureType] = useState("draw");
  const [isDrawing, setIsDrawing] = useState(false);
  const [canvasPoints, setCanvasPoints] = useState([]);
  const [completedSteps, setCompletedSteps] = useState(0);
  
  const handleDocumentSelect = (doc) => {
    setActiveDocument(doc);
    setCompletedSteps(0);
    setSignature("");
    setCanvasPoints([]);
  };
  
  const handleNextStep = () => {
    setCompletedSteps(prev => Math.min(prev + 1, 3));
  };

  const handlePrevStep = () => {
    setCompletedSteps(prev => Math.max(prev - 1, 0));
  };
  
  const handleSignatureComplete = () => {
    setDocuments(docs => 
      docs.map(doc => 
        doc.id === activeDocument.id ? {...doc, status: "signed"} : doc
      )
    );
    setActiveDocument(null);
  };
  
  const handleMouseDown = (e) => {
    if (signatureType === "draw") {
      setIsDrawing(true);
      const rect = e.target.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      setCanvasPoints([...canvasPoints, { x, y }]);
    }
  };
  
  const handleMouseMove = (e) => {
    if (isDrawing && signatureType === "draw") {
      const rect = e.target.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      setCanvasPoints([...canvasPoints, { x, y }]);
    }
  };
  
  const handleMouseUp = () => {
    setIsDrawing(false);
  };
  
  const handleClearSignature = () => {
    setCanvasPoints([]);
    setSignature("");
  };
  
  const renderSignatureCanvas = () => {
    const pathData = canvasPoints.reduce((path, point, i) => {
      if (i === 0) return `M ${point.x} ${point.y}`;
      return `${path} L ${point.x} ${point.y}`;
    }, "");
    
    return (
      <svg width="100%" height="150" className="border rounded-md bg-white">
        <path d={pathData} stroke="black" strokeWidth="2" fill="none" />
      </svg>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-indigo-800">SignFlow</h1>
          <p className="text-slate-600">Seamless E-Signature Integration</p>
        </div>
        <Button className="bg-indigo-600 hover:bg-indigo-700">
          <FileText className="mr-2 h-4 w-4" />
          Upload New Document
        </Button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-5 col-span-1 bg-white shadow-md">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 flex items-center">
            <FileText className="mr-2 h-5 w-5 text-indigo-600" />
            Document Queue
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between text-sm font-medium text-gray-500 mb-2 px-2">
              <span>Document Name</span>
              <span>Status</span>
            </div>
            {documents.map(doc => (
              <div 
                key={doc.id} 
                className={`p-3 rounded-lg flex justify-between items-center cursor-pointer transition-all ${
                  doc.status === 'pending' ? 'bg-orange-50 hover:bg-orange-100' : 'bg-green-50 hover:bg-green-100'
                }`}
                onClick={() => doc.status === 'pending' && handleDocumentSelect(doc)}
              >
                <div>
                  <p className="font-medium">{doc.name}</p>
                  <p className="text-xs text-gray-500">Received: {doc.dateReceived}</p>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                  doc.status === 'pending' ? 'bg-orange-200 text-orange-800' : 'bg-green-200 text-green-800'
                }`}>
                  {doc.status === 'pending' ? 'Pending' : 'Signed'}
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-6">
            <h3 className="text-lg font-medium mb-3 text-gray-700">Quick Stats</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-indigo-50 p-4 rounded-lg">
                <p className="text-xs text-indigo-600 mb-1">Pending</p>
                <p className="text-2xl font-bold text-indigo-800">{documents.filter(d => d.status === 'pending').length}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-xs text-green-600 mb-1">Completed</p>
                <p className="text-2xl font-bold text-green-800">{documents.filter(d => d.status === 'signed').length}</p>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-5 col-span-1 lg:col-span-2 bg-white shadow-md">
          {activeDocument ? (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-800">
                  Sign Document: {activeDocument.name}
                </h2>
                <Button variant="outline" onClick={() => setActiveDocument(null)}>
                  <X className="h-4 w-4 mr-1" /> Close
                </Button>
              </div>
              
              <Progress value={(completedSteps / 3) * 100} className="mb-6" />
              
              <div className="mb-6">
                <div className="flex justify-between text-sm text-gray-500 mb-2">
                  <span className={completedSteps >= 0 ? "text-indigo-600 font-medium" : ""}>Review</span>
                  <span className={completedSteps >= 1 ? "text-indigo-600 font-medium" : ""}>Sign</span>
                  <span className={completedSteps >= 2 ? "text-indigo-600 font-medium" : ""}>Confirm</span>
                  <span className={completedSteps >= 3 ? "text-indigo-600 font-medium" : ""}>Complete</span>
                </div>
              </div>
              
              {completedSteps === 0 && (
                <div className="space-y-4">
                  <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 h-64 flex items-center justify-center">
                    <div className="text-center">
                      <FileText className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-600">Document preview would appear here</p>
                      <p className="text-sm text-gray-500 mt-2">Please review all terms before signing</p>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <Button variant="outline" onClick={() => setActiveDocument(null)}>Cancel</Button>
                    <Button onClick={handleNextStep}>Continue to Sign</Button>
                  </div>
                </div>
              )}
              
              {completedSteps === 1 && (
                <div className="space-y-4">
                  <Tabs defaultValue="draw" onValueChange={setSignatureType}>
                    <TabsList className="mb-4">
                      <TabsTrigger value="draw">Draw Signature</TabsTrigger>
                      <TabsTrigger value="type">Type Signature</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="draw" className="space-y-4">
                      <div 
                        className="border-2 border-dashed border-gray-300 rounded-md h-40 bg-white"
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseUp}
                      >
                        {renderSignatureCanvas()}
                      </div>
                      <p className="text-sm text-gray-500 text-center">Draw your signature above using your mouse</p>
                    </TabsContent>
                    
                    <TabsContent value="type" className="space-y-4">
                      <div className="space-y-3">
                        <Label htmlFor="typed-signature">Type your signature</Label>
                        <Input 
                          id="typed-signature" 
                          value={signature} 
                          onChange={(e) => setSignature(e.target.value)}
                          placeholder="Type your full name"
                          className="font-handwriting text-lg"
                        />
                        {signature && (
                          <div className="p-4 border rounded-md bg-white">
                            <p className="font-handwriting text-xl">{signature}</p>
                          </div>
                        )}
                      </div>
                    </TabsContent>
                  </Tabs>
                  
                  <div className="flex justify-between">
                    <div>
                      <Button variant="outline" onClick={handlePrevStep} className="mr-2">Back</Button>
                      <Button variant="outline" onClick={handleClearSignature}>Clear</Button>
                    </div>
                    <Button 
                      onClick={handleNextStep}
                      disabled={(signatureType === 'draw' && canvasPoints.length === 0) || 
                               (signatureType === 'type' && !signature)}
                    >
                      Continue
                    </Button>
                  </div>
                </div>
              )}
              
              {completedSteps === 2 && (
                <div className="space-y-4">
                  <Card className="p-6 border-2 border-indigo-100">
                    <h3 className="text-lg font-medium mb-4">Confirm Your Signature</h3>
                    
                    <div className="mb-4">
                      <p className="text-sm text-gray-500 mb-2">Document</p>
                      <p className="font-medium">{activeDocument.name}</p>
                    </div>
                    
                    <div className="mb-4">
                      <p className="text-sm text-gray-500 mb-2">Your Signature</p>
                      <div className="p-4 bg-gray-50 rounded-md">
                        {signatureType === 'draw' ? (
                          <div className="h-20">
                            {renderSignatureCanvas()}
                          </div>
                        ) : (
                          <p className="font-handwriting text-xl">{signature}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="bg-yellow-50 p-4 rounded-md text-sm text-yellow-800 mb-4">
                      By clicking "Sign Document", you agree that this electronic signature is as legally binding as your physical signature.
                    </div>
                    
                    <div className="flex justify-between">
                      <Button variant="outline" onClick={handlePrevStep}>Back</Button>
                      <Button onClick={handleNextStep}>Sign Document</Button>
                    </div>
                  </Card>
                </div>
              )}
              
              {completedSteps === 3 && (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Check className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">Document Signed Successfully!</h3>
                  <p className="text-gray-600 mb-6">The document has been signed and sent to all parties.</p>
                  
                  <div className="max-w-md mx-auto bg-gray-50 p-4 rounded-md mb-6">
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-gray-500">Document:</span>
                      <span className="font-medium">{activeDocument.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Signed on:</span>
                      <span className="font-medium">{new Date().toLocaleDateString()}</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-center space-x-3">
                    <Button variant="outline">Download Copy</Button>
                    <Button onClick={handleSignatureComplete}>Return to Dashboard</Button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full py-12 text-center">
              <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center mb-6">
                <Pen className="h-10 w-10 text-indigo-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">E-Signature Platform</h2>
              <p className="text-gray-600 max-w-md mb-6">
                Sign documents electronically from anywhere, anytime. Secure, legally binding, and efficient.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-2xl">
                <Card className="p-4 bg-blue-50 border border-blue-100">
                  <h3 className="font-medium mb-2 text-blue-800">Fast Turnaround</h3>
                  <p className="text-sm text-blue-600">Get documents signed in minutes, not days</p>
                </Card>
                <Card className="p-4 bg-green-50 border border-green-100">
                  <h3 className="font-medium mb-2 text-green-800">Legally Binding</h3>
                  <p className="text-sm text-green-600">Compliant with e-signature laws worldwide</p>
                </Card>
                <Card className="p-4 bg-purple-50 border border-purple-100">
                  <h3 className="font-medium mb-2 text-purple-800">Secure</h3>
                  <p className="text-sm text-purple-600">Bank-level encryption for all documents</p>
                </Card>
              </div>
              <p className="mt-8 text-gray-500">Select a pending document from the list to begin signing</p>
            </div>
          )}
        </Card>
      </div>
      
      <footer className="mt-12 text-center text-gray-500 text-sm">
        <p>SignFlow E-Signature Platform • Secure • Compliant • Efficient</p>
      </footer>
    </div>
  );
}