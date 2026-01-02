import React, { useState, useEffect, useRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { ChevronLeft, ChevronRight, Save, Trash2, ZoomIn, ZoomOut, Bold, Italic, Type, Palette, Minus, Plus, Search, LayoutTemplate, Image as ImageIcon, Upload, Sparkles, BrainCircuit, Move, Check } from 'lucide-react';
import { getDailyMotivation } from '../services/gemini';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Configure PDF Worker from CDN for better stability
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;


const COLORS = ['#1e293b', '#ef4444', '#3b82f6', '#10b981', '#a855f7']; // Slate, Red, Blue, Emerald, Purple


const FONTS = [
    { name: 'Typewriter', value: "'Courier New', Courier, monospace" },
    { name: 'Handwriting', value: "'Caveat', cursive, sans-serif" },
    { name: 'Sans', value: "'Outfit', sans-serif" }
];

export const DigitalPlanner = () => {
    // ... existing state ...
    const [numPages, setNumPages] = useState(null);
    const [pageNumber, setPageNumber] = useState(() => {
        const savedPage = localStorage.getItem('daymaker_planner_page');
        return savedPage ? parseInt(savedPage) : 1;
    });

    // AI State
    const [aiMessage, setAiMessage] = useState(() => {
        const saved = localStorage.getItem('daymaker_daily_quote');
        const savedDate = localStorage.getItem('daymaker_quote_date');
        const today = new Date().toISOString().split('T')[0];

        console.log("DigitalPlanner: Initial State", { saved, savedDate, today });
        if (saved && savedDate === today && saved !== "") return saved;
        return "Tap below to get your daily motivation!";
    });
    const [isThinking, setIsThinking] = useState(false);

    const getAIAdvice = async () => {
        if (isThinking) return;
        setIsThinking(true);
        console.log("DigitalPlanner: getAIAdvice started");
        try {
            const motivation = await getDailyMotivation();
            console.log("DigitalPlanner: Motivation received", motivation);
            setAiMessage(motivation);
            const today = new Date().toISOString().split('T')[0];
            localStorage.setItem('daymaker_daily_quote', motivation);
            localStorage.setItem('daymaker_quote_date', today);
        } catch (error) {
            console.error("DigitalPlanner: getAIAdvice error", error);
            setAiMessage("You are doing great! Keep showing up every single day.");
        } finally {
            setIsThinking(false);
        }
    };

    useEffect(() => {
        const today = new Date().toISOString().split('T')[0];
        const savedDate = localStorage.getItem('daymaker_quote_date');
        const savedMsg = localStorage.getItem('daymaker_daily_quote');

        console.log("DigitalPlanner: useEffect check", { today, savedDate, savedMsg });

        // Fetch if it's a new day, or if we have no message, or if it's the placeholder
        const needsFetch = savedDate !== today ||
            !savedMsg ||
            savedMsg === "Tap below to get your daily motivation!" ||
            savedMsg === "Ready for your daily motivation? Tap below.";

        if (needsFetch) {
            console.log("DigitalPlanner: Condition met, calling getAIAdvice");
            getAIAdvice();
        }
    }, []);

    const [scale, setScale] = useState(0.7); // Default slightly smaller to fit laptop screens
    const [focusedLine, setFocusedLine] = useState(null);

    // Lazy load data correctly
    const [plannerData, setPlannerData] = useState(() => {
        try {
            const saved = localStorage.getItem('daymaker_planner_data');
            return saved ? JSON.parse(saved) : {};
        } catch (e) {
            console.error("Failed to load planner data", e);
            return {};
        }
    });

    const [jumpInput, setJumpInput] = useState('');

    // Current Pen Style (Persisted)
    const [currentStyle, setCurrentStyle] = useState(() => {
        const saved = localStorage.getItem('daymaker_planner_style');
        return saved ? JSON.parse(saved) : {
            fontWeight: 'normal',
            fontStyle: 'normal',
            color: '#1e293b',
            fontSize: '32px',
            fontFamily: FONTS[0].value
        };
    });

    // Page 4 Profile Image Positioning State
    const [imgPos, setImgPos] = useState(() => {
        const saved = localStorage.getItem('daymaker_planner_img_pos');
        // settling on the most symmetrical coordinates based on feedback
        return saved ? JSON.parse(saved) : { top: 20.5, left: 27.8, width: 44.4, height: 50 };
    });
    const [isAdjusting, setIsAdjusting] = useState(false);
    const overlayRef = useRef(null);
    const [dragState, setDragState] = useState(null);

    const handleDragStart = (type, e) => {
        if (!isAdjusting) return;
        e.preventDefault();
        e.stopPropagation();
        setDragState({
            type,
            startX: e.clientX,
            startY: e.clientY,
            startPos: { ...imgPos }
        });
    };

    useEffect(() => {
        const handleDragMove = (e) => {
            if (!dragState || !overlayRef.current) return;

            const rect = overlayRef.current.getBoundingClientRect();
            const dx = ((e.clientX - dragState.startX) / rect.width) * 100;
            const dy = ((e.clientY - dragState.startY) / rect.height) * 100;

            if (dragState.type === 'move') {
                setImgPos({
                    ...dragState.startPos,
                    top: parseFloat((dragState.startPos.top + dy).toFixed(1)),
                    left: parseFloat((dragState.startPos.left + dx).toFixed(1))
                });
            } else if (dragState.type === 'resize') {
                setImgPos({
                    ...dragState.startPos,
                    width: Math.max(5, parseFloat((dragState.startPos.width + dx).toFixed(1))),
                    height: Math.max(5, parseFloat((dragState.startPos.height + dy).toFixed(1)))
                });
            }
        };

        const handleDragEnd = () => setDragState(null);

        if (dragState) {
            window.addEventListener('mousemove', handleDragMove);
            window.addEventListener('mouseup', handleDragEnd);
        }
        return () => {
            window.removeEventListener('mousemove', handleDragMove);
            window.removeEventListener('mouseup', handleDragEnd);
        };
    }, [dragState]);



    // Autosave Page Number
    useEffect(() => {
        localStorage.setItem('daymaker_planner_page', pageNumber.toString());
    }, [pageNumber]);

    // Autosave Planner Data
    useEffect(() => {
        const handler = setTimeout(() => {
            localStorage.setItem('daymaker_planner_data', JSON.stringify(plannerData));
        }, 500);
        return () => clearTimeout(handler);
    }, [plannerData]);

    // Autosave Current Style
    useEffect(() => {
        localStorage.setItem('daymaker_planner_style', JSON.stringify(currentStyle));
    }, [currentStyle]);

    // Autosave Image Position
    useEffect(() => {
        localStorage.setItem('daymaker_planner_img_pos', JSON.stringify(imgPos));
    }, [imgPos]);


    const saveAllData = () => {
        localStorage.setItem('daymaker_planner_data', JSON.stringify(plannerData));
        localStorage.setItem('daymaker_planner_page', pageNumber.toString());
        localStorage.setItem('daymaker_planner_style', JSON.stringify(currentStyle));
        alert("Planner Synced Successfully!");
    };

    function onDocumentLoadSuccess({ numPages }) {
        setNumPages(numPages);
    }

    const handleJump = (e) => {
        if (e.key === 'Enter') {
            const page = parseInt(jumpInput);
            if (page >= 1 && page <= numPages) {
                setPageNumber(page);
                setJumpInput('');
            } else {
                alert(`Please enter a page between 1 and ${numPages}`);
            }
        }
    };

    // Helper to get text/style safely
    const getLineData = (key) => {
        const data = plannerData[key];

        // If no data, or text is empty/whitespace, ALWAYS interpret as "Current Pen" properties
        if (!data || (typeof data !== 'string' && (!data.text || !data.text.trim()))) {
            return { text: data?.text || '', style: currentStyle };
        }

        let style = currentStyle;
        if (typeof data !== 'string' && data.style) {
            style = data.style;
        }

        // Auto-fix: If font is too small (legacy 14px or 20px), bump it up
        if (style.fontSize === '14px' || style.fontSize === '20px') {
            style = { ...style, fontSize: '32px' };
        }

        if (typeof data === 'string') return { text: data, style };
        return { ...data, style };
    };

    const handleInputChange = (lineIndex, text) => {
        const key = `page-${pageNumber}-line-${lineIndex}`;
        // Preserve existing style or use current if new
        const existingData = getLineData(key);
        const styleToUse = existingData.text ? existingData.style : currentStyle;

        setPlannerData(prev => ({
            ...prev,
            [key]: { text, style: styleToUse }
        }));
    };

    // ACTIVE STYLE UPDATE: Updates Global Tool + Focused Line
    const updateStyle = (key, value) => {
        // 1. Update Tool State
        setCurrentStyle(prev => ({ ...prev, [key]: value }));

        // 2. If a line is focused, update its style immediately
        if (focusedLine !== null) {
            const lineKey = `page-${pageNumber}-line-${focusedLine}`;
            const currentData = getLineData(lineKey);

            setPlannerData(prev => ({
                ...prev,
                [lineKey]: {
                    ...currentData,
                    style: { ...currentData.style, [key]: value }
                }
            }));
        }
    };

    // Toggle Helpers
    const toggleBold = () => updateStyle('fontWeight', currentStyle.fontWeight === 'bold' ? 'normal' : 'bold');
    const toggleItalic = () => updateStyle('fontStyle', currentStyle.fontStyle === 'italic' ? 'normal' : 'italic');
    const changeSize = (delta) => {
        const newSize = Math.max(10, parseInt(currentStyle.fontSize) + delta) + 'px';
        updateStyle('fontSize', newSize);
    };

    // Image Compression Helper
    const compressImage = (file) => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target.result;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const MAX_WIDTH = 600; // Limit width for storage efficiency
                    const scaleSize = MAX_WIDTH / img.width;
                    canvas.width = MAX_WIDTH;
                    canvas.height = img.height * scaleSize;

                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                    resolve(canvas.toDataURL('image/jpeg', 0.7)); // Compress to JPEG 70%
                };
            };
        });
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (file) {
            try {
                const compressedBase64 = await compressImage(file);
                const key = `page-${pageNumber}-cover-image`;
                setPlannerData(prev => ({
                    ...prev,
                    [key]: compressedBase64
                }));
            } catch (error) {
                console.error("Image upload failed", error);
                alert("Could not process image. Please try another.");
            }
        }
    };

    const clearImage = (e) => {
        e.stopPropagation();
        const key = `page-${pageNumber}-cover-image`;
        const newData = { ...plannerData };
        delete newData[key];
        setPlannerData(newData);
    };

    return (
        <div className="flex flex-row h-screen bg-[#0B0D17] overflow-hidden">

            {/* Sidebar Tools (Full Console) */}
            <div className="w-72 bg-[#1A1D2D] border-r border-white/10 p-6 pt-16 flex flex-col gap-6 shadow-2xl h-full overflow-y-auto custom-scrollbar z-20">

                {/* 0. AI Assistant Widget */}
                <div className="bg-gradient-to-br from-indigo-900/50 to-purple-900/50 p-4 rounded-xl border border-indigo-500/20 shadow-lg relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-40 transition-opacity">
                        <Sparkles size={40} className="text-white" />
                    </div>

                    <h3 className="text-xs font-bold uppercase tracking-widest text-indigo-300 flex items-center gap-2 mb-3">
                        <BrainCircuit size={14} /> AI Partner
                    </h3>

                    <div className="min-h-[60px] mb-3">
                        {isThinking ? (
                            <div className="flex items-center gap-2 text-indigo-200 text-xs animate-pulse">
                                <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" />
                                <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-75" />
                                <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-150" />
                                <span className="ml-1">Analysing...</span>
                            </div>
                        ) : (
                            <p className="text-sm text-white/90 italic leading-relaxed">
                                "{aiMessage}"
                            </p>
                        )}
                    </div>

                    <button
                        onClick={getAIAdvice}
                        disabled={isThinking}
                        className="w-full py-2 bg-indigo-500 hover:bg-indigo-400 text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                        <Sparkles size={12} /> Get Motivation
                    </button>
                </div>

                {/* 1. Navigation Console */}
                <div className="bg-black/20 p-4 rounded-xl border border-white/5 space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
                        <LayoutTemplate size={14} /> Navigation
                    </h3>

                    {/* Prev / Page / Next */}
                    <div className="flex items-center justify-between bg-[#0B0D17] rounded-lg p-1">
                        <button onClick={() => setPageNumber(p => Math.max(p - 1, 1))} disabled={pageNumber <= 1} className="p-2 hover:bg-white/10 rounded-md text-cyan-400 disabled:opacity-30"><ChevronLeft size={20} /></button>
                        <span className="font-mono font-bold text-white text-sm">{pageNumber} / {numPages || '-'}</span>
                        <button onClick={() => setPageNumber(p => Math.min(p + 1, numPages))} disabled={pageNumber >= numPages} className="p-2 hover:bg-white/10 rounded-md text-cyan-400 disabled:opacity-30"><ChevronRight size={20} /></button>
                    </div>

                    {/* Jump to Page */}
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 text-slate-600" size={14} />
                        <input
                            type="number"
                            placeholder="Jump to page..."
                            className="w-full bg-[#0B0D17] border border-white/5 rounded-lg py-2 pl-9 pr-3 text-sm text-white focus:border-cyan-400/50 outline-none"
                            value={jumpInput}
                            onChange={(e) => setJumpInput(e.target.value)}
                            onKeyDown={handleJump}
                        />
                    </div>

                    {/* Zoom Controls */}
                    <div className="flex gap-2">
                        <button onClick={() => setScale(0.6)} className="flex-1 bg-[#0B0D17] hover:bg-cyan-900/20 text-xs py-2 rounded-lg text-cyan-400 font-bold border border-white/5">Fit</button>
                        <button onClick={() => setScale(s => Math.max(s - 0.1, 0.4))} className="p-2 bg-[#0B0D17] hover:bg-white/5 rounded-lg text-slate-400"><ZoomOut size={16} /></button>
                        <button onClick={() => setScale(s => Math.min(s + 0.1, 2.0))} className="p-2 bg-[#0B0D17] hover:bg-white/5 rounded-lg text-slate-400"><ZoomIn size={16} /></button>
                    </div>
                </div>

                {/* 2. Formatting Console */}
                <div className="space-y-6">
                    <div>
                        <h3 className="text-white font-bold mb-3 flex items-center gap-2 text-sm"><Palette size={14} className="text-cyan-400" /> Ink Color</h3>
                        <div className="grid grid-cols-5 gap-2">
                            {COLORS.map(c => (
                                <button
                                    key={c}
                                    onClick={() => updateStyle('color', c)}
                                    className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${currentStyle.color === c ? 'border-white scale-110 shadow-lg' : 'border-transparent'}`}
                                    style={{ backgroundColor: c }}
                                />
                            ))}
                        </div>
                    </div>

                    <div>
                        <h3 className="text-white font-bold mb-3 flex items-center gap-2 text-sm"><Type size={14} className="text-cyan-400" /> Typography</h3>
                        <div className="flex gap-2 mb-3 bg-black/20 p-1 rounded-lg">
                            <button
                                onClick={toggleBold}
                                className={`flex-1 py-1.5 rounded-md transition-colors ${currentStyle.fontWeight === 'bold' ? 'bg-white/10 text-cyan-400' : 'text-slate-400 hover:text-white'}`}
                            >
                                <Bold size={16} />
                            </button>
                            <button
                                onClick={toggleItalic}
                                className={`flex-1 py-1.5 rounded-md transition-colors ${currentStyle.fontStyle === 'italic' ? 'bg-white/10 text-cyan-400' : 'text-slate-400 hover:text-white'}`}
                            >
                                <Italic size={16} />
                            </button>
                        </div>

                        <div className="space-y-2">
                            {FONTS.map(f => (
                                <button
                                    key={f.name}
                                    onClick={() => updateStyle('fontFamily', f.value)}
                                    className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-colors ${currentStyle.fontFamily === f.value ? 'bg-cyan-400/10 text-cyan-400 border border-cyan-400/20' : 'text-slate-400 hover:bg-white/5'}`}
                                    style={{ fontFamily: f.value }}
                                >
                                    {f.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h3 className="text-white font-bold mb-3 flex items-center gap-2 text-sm">Text Size</h3>
                        <div className="flex items-center gap-3 bg-black/20 p-2 rounded-lg">
                            <button onClick={() => changeSize(-2)} className="p-1 text-slate-400 hover:text-white"><Minus size={14} /></button>
                            <span className="flex-1 text-center font-mono text-white text-sm">{currentStyle.fontSize}</span>
                            <button onClick={() => changeSize(2)} className="p-1 text-slate-400 hover:text-white"><Plus size={14} /></button>
                        </div>
                    </div>
                </div>

                <div className="mt-auto">
                    <button onClick={saveAllData} className="btn-primary w-full flex items-center justify-center gap-2 !py-3">
                        <Save size={18} /> Sync Planner
                    </button>
                    <p className="text-[10px] text-slate-500 text-center mt-3">Auto-save enabled • LocalStorage</p>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 h-full bg-[#12141F] overflow-y-auto overflow-x-auto flex flex-col items-center p-4 md:p-12 relative custom-scrollbar">

                {/* TOP AI MOTIVATION BANNER */}
                <div className="w-full max-w-4xl mb-6 animate-in fade-in slide-in-from-top-4 duration-1000 shrink-0">
                    <div className="bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-indigo-500/10 border border-white/5 rounded-2xl p-6 text-center relative overflow-hidden backdrop-blur-sm">
                        {/* Decorative Sparkles */}
                        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                            <Sparkles className="absolute top-2 left-[10%] text-indigo-400 rotate-12" size={16} />
                            <Sparkles className="absolute bottom-4 right-[15%] text-purple-400 -rotate-12" size={20} />
                        </div>

                        {isThinking ? (
                            <div className="flex flex-col items-center gap-3">
                                <div className="flex gap-2">
                                    <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                                    <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                                    <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" />
                                </div>
                                <p className="text-slate-500 text-[10px] font-medium tracking-[0.2em] uppercase">Consulting AI Partner</p>
                            </div>
                        ) : (
                            <div className="relative z-10">
                                <span className="text-[10px] font-bold text-indigo-400/80 uppercase tracking-[0.3em] mb-3 block">Today's Focus Intent</span>
                                <h1 className="text-xl md:text-2xl font-serif italic text-white/90 leading-tight px-4">
                                    "{aiMessage}"
                                </h1>
                            </div>
                        )}
                    </div>
                </div>

                {/* PDF Wrapper */}
                <div
                    className="relative shadow-2xl rounded-lg border border-white/10 bg-white transition-transform duration-200 shrink-0 mb-40 overflow-hidden"
                    style={{
                        transform: `scale(${scale})`,
                        transformOrigin: 'top center',
                        width: 'fit-content'
                    }}
                >
                    <Document
                        file="/2026_free_planner.pdf"
                        onLoadSuccess={onDocumentLoadSuccess}
                        onLoadError={(error) => console.error("PDF Load Error:", error)}
                        className="flex justify-center"
                        loading={<div className="text-white p-10 flex flex-col items-center gap-4">
                            <div className="w-8 h-8 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                            <span>Loading Digital Planner...</span>
                        </div>}
                        error={<div className="text-red-400 p-10 text-center bg-red-400/10 rounded-xl border border-red-400/20">
                            <p className="font-bold mb-2">Failed to load Planner</p>
                            <p className="text-xs opacity-70">The PDF file might be corrupted or missing. Try re-uploading.</p>
                        </div>}
                    >
                        <Page
                            pageNumber={pageNumber}
                            scale={1.0}
                            renderTextLayer={false}
                            renderAnnotationLayer={false}
                            className="shadow-lg"
                        />
                    </Document>

                    {/* Interactive Overlay Layer */}
                    <div ref={overlayRef} className="absolute inset-0 z-10 px-[10%] pt-[15%] pb-[10%] flex flex-col gap-[2px] pointer-events-none">

                        {/* SPECIAL FEATURE: Profile Photo Frame (Only on Page 4) */}
                        {pageNumber === 4 && (
                            <div
                                className={`absolute pointer-events-auto z-20 group ${isAdjusting ? 'cursor-move ring-2 ring-cyan-400 ring-offset-2 ring-offset-transparent' : ''}`}
                                style={{
                                    top: `${imgPos.top}%`,
                                    left: `${imgPos.left}%`,
                                    width: `${imgPos.width}%`,
                                    height: `${imgPos.height}%`
                                }}
                                onMouseDown={(e) => handleDragStart('move', e)}
                            >
                                {(plannerData[`page-4-profile-image`] || true) ? (
                                    <div className="relative w-full h-full">
                                        <img
                                            src={plannerData[`page-4-profile-image`] || "/profile.png"}
                                            alt="Profile"
                                            className={`w-full h-full object-cover rounded-sm shadow-inner transition-opacity ${isAdjusting ? 'opacity-50' : 'opacity-98 hover:opacity-100'}`}
                                            draggable={false}
                                        />

                                        {/* Resize Handle */}
                                        {isAdjusting && (
                                            <div
                                                className="absolute -bottom-1 -right-1 w-4 h-4 bg-cyan-400 rounded-full cursor-se-resize shadow-lg flex items-center justify-center z-30"
                                                onMouseDown={(e) => handleDragStart('resize', e)}
                                            >
                                                <div className="w-1.5 h-1.5 border-r border-b border-black"></div>
                                            </div>
                                        )}

                                        <div className="absolute top-2 right-2 flex gap-2">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); setIsAdjusting(!isAdjusting); }}
                                                className={`p-1.5 rounded-full shadow-lg transition-all ${isAdjusting ? 'bg-cyan-400 text-black' : 'bg-white/80 text-slate-600 opacity-0 group-hover:opacity-100 hover:bg-white'}`}
                                                title="Toggle Adjust Mode"
                                            >
                                                {isAdjusting ? <Check size={14} /> : <Move size={14} />}
                                            </button>
                                            {!isAdjusting && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        const key = `page-4-profile-image`;
                                                        const newData = { ...plannerData };
                                                        delete newData[key];
                                                        setPlannerData(newData);
                                                    }}
                                                    className="bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 shadow-lg"
                                                    title="Remove Photo"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            )}
                                        </div>

                                        {/* Adjustment Overlay Panel */}
                                        {isAdjusting && (
                                            <div
                                                className="absolute -right-48 top-0 w-44 bg-[#1A1D2D] border border-white/10 rounded-xl p-3 shadow-2xl flex flex-col gap-3 z-30 pointer-events-auto cursor-default"
                                                onMouseDown={(e) => e.stopPropagation()}
                                            >
                                                <div className="flex justify-between items-center border-b border-white/5 pb-2">
                                                    <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest">Adjust Frame</span>
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setImgPos({ top: 20.5, left: 27.8, width: 44.4, height: 50 });
                                                            }}
                                                            className="text-[8px] bg-white/5 hover:bg-white/10 px-2 py-0.5 rounded text-white transition-colors"
                                                            title="Restore Perfect Alignment"
                                                        >
                                                            Reset
                                                        </button>
                                                        <button onClick={() => setIsAdjusting(false)} className="text-white hover:text-cyan-400 transition-colors"><Check size={14} /></button>
                                                    </div>
                                                </div>

                                                <div className="space-y-2">
                                                    {['top', 'left', 'width', 'height'].map(attr => (
                                                        <div key={attr} className="space-y-1">
                                                            <div className="flex justify-between text-[8px] text-slate-500 uppercase font-black">
                                                                <span>{attr}</span>
                                                                <span className="text-white">{imgPos[attr]}%</span>
                                                            </div>
                                                            <input
                                                                type="range"
                                                                min="0"
                                                                max="100"
                                                                step="0.1"
                                                                value={imgPos[attr]}
                                                                onChange={(e) => setImgPos(prev => ({ ...prev, [attr]: parseFloat(e.target.value) }))}
                                                                className="w-full accent-cyan-400 h-1"
                                                            />
                                                        </div>
                                                    ))}
                                                </div>
                                                <p className="text-[8px] text-slate-500 italic mt-1">Sliders use 0.1% steps for max precision.</p>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <label className="w-full h-full flex flex-col items-center justify-center border-2 border-dashed border-slate-300 hover:border-cyan-400 bg-black/5 hover:bg-cyan-50/20 rounded-lg cursor-pointer transition-colors group">
                                        <div className="bg-white/80 p-4 rounded-full shadow-sm mb-2 group-hover:scale-110 transition-transform">
                                            <Upload className="text-slate-400 group-hover:text-cyan-500" size={32} />
                                        </div>
                                        <span className="text-slate-500 font-handwriting text-xl group-hover:text-cyan-600">Click to add photo</span>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={async (e) => {
                                                const file = e.target.files[0];
                                                if (file) {
                                                    const base64 = await compressImage(file);
                                                    setPlannerData(prev => ({ ...prev, [`page-4-profile-image`]: base64 }));
                                                }
                                            }}
                                        />
                                    </label>
                                )}
                            </div>
                        )}

                        {[...Array(35)].map((_, i) => {
                            const key = `page-${pageNumber}-line-${i}`;
                            const { text, style } = getLineData(key);

                            const displayStyle = {
                                ...style,
                                height: '2.5%',
                                lineHeight: '100%',
                                background: 'transparent'
                            };

                            return (
                                <input
                                    key={key}
                                    type="text"
                                    placeholder=""
                                    className="w-full border-b border-transparent focus:border-cyan-500/30 hover:bg-cyan-100/10 focus:bg-cyan-100/10 outline-none px-2 transition-all pointer-events-auto"
                                    style={displayStyle}
                                    value={text}
                                    onChange={(e) => handleInputChange(i, e.target.value)}
                                    // Sync State on Focus
                                    onFocus={() => {
                                        setFocusedLine(i);
                                        // Removed: style sampling to prevent resetting global pen settings
                                    }}
                                    onBlur={() => setFocusedLine(null)}
                                />
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};