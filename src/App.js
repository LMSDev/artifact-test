import { useState, useRef } from "react";
import { FileText, CheckCircle, Edit3, Download, RefreshCw, Send } from "lucide-react";
import { Button } from "/components/ui/button";
import { Card } from "/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "/components/ui/tabs";
import { Progress } from "/components/ui/progress";
import { Badge } from "/components/ui/badge";
import { Separator } from "/components/ui/separator";
import { Input } from "/components/ui/input";

export default function ESignatureApp() {
  const [documents, setDocuments] = useState([
    {
      id: 1,
      name: "Contract Agreement.pdf",
      status: "pending",
      date: "2023-11-10",
      signers: ["john@example.com", "sarah@company.com"],
      completedBy: []
    },
    {
      id: 2,
      name: "NDA Document.pdf",
      status: "completed",
      date: "2023-11-05",
      signers: ["john@example.com"],
      completedBy: ["john@example.com"]
    },
    {
      id: 3,
      name: "Project Proposal.pdf",
      status: "in-progress",
      date: "2023-11-08",
      signers: ["sarah@company.com", "mike@client.com", "john@example.com"],
      completedBy: ["sarah@company.com"]
    }
  ]);

  const [activeTab, setActiveTab] = useState("dashboard");
  const [showSignatureDialog, setShowSignatureDialog] = useState(false);
  const [currentDocument, setCurrentDocument] = useState(null);
  const [signature, setSignature] = useState(null);
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [signatureType, setSignatureType] = useState("draw");
  const [typedSignature, setTypedSignature] = useState("");
  const [selectedFont, setSelectedFont] = useState("Dancing Script");

  const handleDocumentClick = (doc) => {
    setCurrentDocument(doc);
    setActiveTab("preview");
  };

  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.beginPath();
    ctx.moveTo(getMousePos(canvas, e).x, getMousePos(canvas, e).y);
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#000";
    ctx.lineTo(getMousePos(canvas, e).x, getMousePos(canvas, e).y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (isDrawing) {
      const canvas = canvasRef.current;
      setSignature(canvas.toDataURL());
      setIsDrawing(false);
    }
  };

  const getMousePos = (canvas, e) => {
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setSignature(null);
    setTypedSignature("");
  };

  const applySignature = () => {
    if ((signatureType === "draw" && signature) || (signatureType === "type" && typedSignature)) {
      const updatedDocuments = documents.map(doc => {
        if (doc.id === currentDocument.id) {
          // Simulate user email
          const userEmail = "john@example.com";
          if (!doc.completedBy.includes(userEmail)) {
            return {
              ...doc,
              completedBy: [...doc.completedBy, userEmail],
              status: doc.signers.length === doc.completedBy.length + 1 ? "completed" : "in-progress"
            };
          }
        }
        return doc;
      });
      
      setDocuments(updatedDocuments);
      setShowSignatureDialog(false);
      setSignature(null);
      setTypedSignature("");
      setActiveTab("dashboard");
    }
  };

  const generateTypeSignature = () => {
    if (typedSignature) {
      const canvas = document.createElement('canvas');
      canvas.width = 400;
      canvas.height = 150;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = "#000";
      ctx.font = `italic 40px "${selectedFont}"`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(typedSignature, canvas.width / 2, canvas.height / 2);
      setSignature(canvas.toDataURL());
    }
  };

  const getCompletionPercentage = (doc) => {
    return Math.round((doc.completedBy.length / doc.signers.length) * 100);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500";
      case "in-progress":
        return "bg-blue-500";
      case "completed":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Edit3 className="h-8 w-8 text-indigo-600" />
              <h1 className="text-2xl font-bold text-gray-900">SignEasy</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200 px-3 py-1">
                John Doe
              </Badge>
              <Button size="sm" variant="outline">Logout</Button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex justify-between items-center mb-6">
            <TabsList className="bg-white">
              <TabsTrigger value="dashboard" className="data-[state=active]:bg-indigo-100 data-[state=active]:text-indigo-700">
                Dashboard
              </TabsTrigger>
              <TabsTrigger value="preview" className="data-[state=active]:bg-indigo-100 data-[state=active]:text-indigo-700">
                Document Preview
              </TabsTrigger>
            </TabsList>

            <div>
              <Button variant="outline" className="mr-2">
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </Button>
              <Button>
                <FileText className="mr-2 h-4 w-4" />
                Upload New Document
              </Button>
            </div>
          </div>

          <TabsContent value="dashboard" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card className="p-6 bg-white shadow-md rounded-lg border-indigo-100">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-700">Pending Signatures</h3>
                  <span className="text-2xl font-bold text-yellow-500">
                    {documents.filter(d => d.status === "pending").length}
                  </span>
                </div>
              </Card>
              <Card className="p-6 bg-white shadow-md rounded-lg border-indigo-100">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-700">In Progress</h3>
                  <span className="text-2xl font-bold text-blue-500">
                    {documents.filter(d => d.status === "in-progress").length}
                  </span>
                </div>
              </Card>
              <Card className="p-6 bg-white shadow-md rounded-lg border-indigo-100">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-700">Completed</h3>
                  <span className="text-2xl font-bold text-green-500">
                    {documents.filter(d => d.status === "completed").length}
                  </span>
                </div>
              </Card>
            </div>

            <h2 className="text-xl font-semibold text-gray-800 mb-4">Your Documents</h2>
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="divide-y divide-gray-200">
                {documents.map((doc) => (
                  <div 
                    key={doc.id} 
                    className="p-6 hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => handleDocumentClick(doc)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getStatusColor(doc.status)}`}>
                          <FileText className="h-5 w-5 text-white" />
                        </div>
                        <div className="ml-4">
                          <h3 className="text-lg font-medium text-gray-900">{doc.name}</h3>
                          <p className="text-sm text-gray-500">Created on: {doc.date}</p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <Badge className={`mr-3 ${
                          doc.status === "pending" ? "bg-yellow-100 text-yellow-800" :
                          doc.status === "in-progress" ? "bg-blue-100 text-blue-800" :
                          "bg-green-100 text-green-800"
                        }`}>
                          {doc.status.replace("-", " ")}
                        </Badge>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-700">{doc.completedBy.length} of {doc.signers.length} signed</p>
                          <Progress value={getCompletionPercentage(doc)} className="h-2 w-24 mt-1" />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="preview">
            {currentDocument && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">{currentDocument.name}</h2>
                  <div className="flex space-x-3">
                    <Button variant="outline" size="sm">
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </Button>
                    
                    {!currentDocument.completedBy.includes("john@example.com") && (
                      <Button 
                        size="sm" 
                        onClick={() => setShowSignatureDialog(true)}
                      >
                        <Edit3 className="mr-2 h-4 w-4" />
                        Sign Document
                      </Button>
                    )}
                  </div>
                </div>

                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-medium text-gray-700">Signing Progress</h3>
                    <span className="text-sm font-medium text-gray-600">
                      {currentDocument.completedBy.length} of {currentDocument.signers.length} signers
                    </span>
                  </div>
                  <Progress value={getCompletionPercentage(currentDocument)} className="h-2" />
                  
                  <div className="mt-4 space-y-2">
                    {currentDocument.signers.map((signer, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">{signer}</span>
                        {currentDocument.completedBy.includes(signer) ? (
                          <Badge className="bg-green-100 text-green-800">
                            <CheckCircle className="mr-1 h-3 w-3" />
                            Signed
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-yellow-600">Waiting</Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <Separator className="my-6" />

                <div className="border border-gray-200 rounded-lg p-4 mb-6">
                  <div className="bg-gray-100 rounded p-4 min-h-[400px] flex items-center justify-center">
                    <div className="text-center">
                      <img 
                        src="/api/placeholder/600/800" 
                        alt="Document preview" 
                        className="mx-auto border border-gray-300 shadow-sm" 
                      />
                      <p className="mt-4 text-gray-500 text-sm">Document preview</p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <Button variant="outline" onClick={() => setActiveTab("dashboard")}>
                    Back to Dashboard
                  </Button>
                  
                  {currentDocument.status !== "completed" && (
                    <Button>
                      <Send className="mr-2 h-4 w-4" />
                      Send Reminder
                    </Button>
                  )}
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>

      <Dialog open={showSignatureDialog} onOpenChange={setShowSignatureDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Sign Document</DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            <Tabs defaultValue="draw" onValueChange={setSignatureType}>
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="draw">Draw Signature</TabsTrigger>
                <TabsTrigger value="type">Type Signature</TabsTrigger>
              </TabsList>
              
              <TabsContent value="draw" className="mt-2">
                <div className="border-2 border-dashed border-gray-300 rounded-md p-1 bg-white">
                  <canvas
                    ref={canvasRef}
                    width="400"
                    height="150"
                    className="w-full touch-none cursor-crosshair bg-white"
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                  />
                </div>
                <p className="text-sm text-gray-500 mt-2">Draw your signature above</p>
              </TabsContent>
              
              <TabsContent value="type" className="mt-2">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">
                      Type your signature:
                    </label>
                    <Input
                      type="text"
                      value={typedSignature}
                      onChange={(e) => setTypedSignature(e.target.value)}
                      placeholder="Your name"
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">
                      Select font style:
                    </label>
                    <select
                      value={selectedFont}
                      onChange={(e) => setSelectedFont(e.target.value)}
                      className="w-full rounded-md border border-gray-300 py-2 px-3"
                    >
                      <option value="Dancing Script">Handwritten</option>
                      <option value="Pacifico">Stylish</option>
                      <option value="Times New Roman">Formal</option>
                    </select>
                  </div>
                  
                  <Button 
                    onClick={generateTypeSignature} 
                    variant="outline" 
                    className="w-full"
                    disabled={!typedSignature}
                  >
                    Preview Signature
                  </Button>
                  
                  {signature && (
                    <div className="border rounded-md p-4 bg-white">
                      <img src={signature} alt="Signature preview" className="mx-auto" />
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
          
          <DialogFooter className="flex justify-between sm:justify-between">
            <Button variant="outline" onClick={clearSignature}>
              Clear
            </Button>
            <div className="space-x-2">
              <Button variant="outline" onClick={() => setShowSignatureDialog(false)}>
                Cancel
              </Button>
              <Button 
                onClick={applySignature}
                disabled={(signatureType === "draw" && !signature) || (signatureType === "type" && !typedSignature)}
              >
                Apply Signature
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <footer className="bg-gray-50 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2">
              <Edit3 className="h-5 w-5 text-indigo-600" />
              <span className="text-gray-600 font-medium">SignEasy</span>
            </div>
            <div className="mt-4 md:mt-0">
              <p className="text-sm text-gray-500">© 2023 SignEasy. All rights reserved.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}