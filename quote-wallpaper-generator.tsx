"use client"

import {
  useRef,
  useEffect,
  useState,
  useCallback,
  useMemo,
  useReducer,
  memo,
  Dispatch,
  FC,
} from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Download,
  RefreshCw,
  Settings,
  Palette,
  Underline,
  Highlighter,
  Sparkles,
  Grid,
  Minus,
  Moon,
  Sun,
} from "lucide-react"
import { cn } from "@/lib/utils" 
// 1. CONSTANTS
const FONTS = [
  { name: "Inter", value: "Inter", script: "english", category: "Modern Sans" },
  { name: "Geist Sans", value: "Geist Sans", script: "english", category: "Modern Sans" },
  { name: "Poppins", value: "Poppins", script: "english", category: "Modern Sans" },
  { name: "Playfair Display", value: "Playfair Display", script: "english", category: "Classic Serif" },
  { name: "Crimson Text", value: "Crimson Text", script: "english", category: "Classic Serif" },
  { name: "Lora", value: "Lora", script: "english", category: "Classic Serif" },
  { name: "Merriweather", value: "Merriweather", script: "english", category: "Classic Serif" },
  { name: "Cinzel", value: "Cinzel", script: "english", category: "Decorative" },
  { name: "Old Standard TT", value: "Old Standard TT", script: "english", category: "Decorative" },
  { name: "Noto Sans Devanagari", value: "Noto Sans Devanagari", script: "devanagari", category: "Modern" },
  { name: "Noto Serif Devanagari", value: "Noto Serif Devanagari", script: "devanagari", category: "Traditional" },
  { name: "Hind", value: "Hind", script: "devanagari", category: "Modern" },
  { name: "Kalam", value: "Kalam", script: "devanagari", category: "Decorative" },
];
const RESOLUTIONS = [
  { name: "Full HD", value: "1920x1080", width: 1920, height: 1080 },
  { name: "4K UHD", value: "3840x2160", width: 3840, height: 2160 },
  { name: "Mobile", value: "1080x1920", width: 1080, height: 1920 },
  { name: "Square", value: "1080x1080", width: 1080, height: 1080 },
];
const WALLPAPER_STYLES = [
  { name: "Particles", value: "particles", icon: Sparkles },
  { name: "Grid", value: "grid", icon: Grid },
  { name: "Minimal", value: "minimal", icon: Minus },
];
const BACKGROUNDS = [
  { name: "Pure Black", value: "black", color: "#000000" },
  { name: "Pure White", value: "white", color: "#FFFFFF" },
  { name: "Charcoal", value: "charcoal", color: "#1A1A1A" },
  { name: "Light Gray", value: "light-gray", color: "#F5F5F5" },
  { name: "Navy", value: "navy", color: "#1E3A8A" },
  { name: "Forest", value: "forest", color: "#166534" },
  { name: "Purple", value: "purple", color: "#581C87" },
  { name: "Burgundy", value: "burgundy", color: "#7F1D1D" },
];
const HIGHLIGHT_COLORS = [
  { name: "None", value: "none" },
  { name: "Yellow", value: "#FFFF0080" },
  { name: "Blue", value: "#ADD8E680" },
  { name: "Green", value: "#90EE9080" },
  { name: "Pink", value: "#FFB6C180" },
  { name: "Orange", value: "#FFD70080" },
];

// 2. TYPES
interface WallpaperState {
  quote: string; author: string; source: string; font: string; resolution: string; style: string;
  textColor: string; highlightColor: string; underline: boolean; background: string;
  particleCount: number; layout: string;
}
type WallpaperAction = { type: "SET_FIELD"; payload: { field: keyof WallpaperState; value: any } }
interface Particle { x: number; y: number; vx: number; vy: number; size: number; opacity: number }

// 3. STATE MANAGEMENT (REDUCER)
const initialState: WallpaperState = {
  quote: "The only way to do great work is to love what you do.", author: "Steve Jobs", source: "",
  font: "Playfair Display", resolution: "1920x1080", style: "particles", textColor: "#FFFFFF",
  highlightColor: "none", underline: false, background: "black", particleCount: 50, layout: "traditional",
};

function wallpaperReducer(state: WallpaperState, action: WallpaperAction): WallpaperState {
  switch (action.type) {
    case "SET_FIELD": return { ...state, [action.payload.field]: action.payload.value }
    default: throw new Error(`Unhandled action type`);
  }
}

// 4. CUSTOM HOOKS
function useThemeManager() {
  const [isDarkTheme, setIsDarkTheme] = useState(true);
  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDarkTheme);
  }, [isDarkTheme]);
  const toggleTheme = useCallback(() => setIsDarkTheme((prev) => !prev), []);
  return { isDarkTheme, toggleTheme };
}


//Debounces a value to prevent rapid updates, improving performance for expensive operations.

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => { setDebouncedValue(value) }, delay);
    return () => { clearTimeout(handler) };
  }, [value, delay]);
  return debouncedValue;
}

function useCanvasRenderer(state: WallpaperState) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const particlesRef = useRef<Particle[]>([]);
  const lastFrameTime = useRef<number>(0);
  const [fontsLoaded, setFontsLoaded] = useState(false);

  const {
    quote, author, source, font, resolution: resolutionValue, style, textColor, highlightColor,
    underline, background, particleCount, layout,
  } = state;

  const resolution = useMemo(() => RESOLUTIONS.find((r) => r.value === resolutionValue) || RESOLUTIONS[0], [resolutionValue]);
  const backgroundColor = useMemo(() => BACKGROUNDS.find((bg) => bg.value === background)?.color || "#000000", [background]);
  const isLightBackground = useMemo(() => ["#FFFFFF", "#F5F5F5"].includes(backgroundColor), [backgroundColor]);
  const adaptiveTextColor = useMemo(() => (isLightBackground ? "#000000" : textColor), [isLightBackground, textColor]);

  useEffect(() => {
    document.fonts.ready.then(() => setFontsLoaded(true)).catch((err) => {
      console.error("Font loading error:", err); setFontsLoaded(true);
    });
  }, []);

  const wrapText = useCallback((ctx: CanvasRenderingContext2D, text: string, maxWidth: number) => {
    const words = text.split(" "); let lines: string[] = []; let currentLine = words[0] || "";
    for (let i = 1; i < words.length; i++) {
      const testLine = `${currentLine} ${words[i]}`;
      if (ctx.measureText(testLine).width > maxWidth && currentLine.length > 0) {
        lines.push(currentLine); currentLine = words[i];
      } else { currentLine = testLine }
    }
    lines.push(currentLine); return lines;
  }, []);

  const initializeParticles = useCallback(() => {
    const count = Math.floor((particleCount / 100) * 100);
    particlesRef.current = Array.from({ length: count }, () => ({
      x: Math.random() * resolution.width, y: Math.random() * resolution.height,
      vx: (Math.random() - 0.5) * 0.5, vy: (Math.random() - 0.5) * 0.5,
      size: Math.random() * 2 + 0.5, opacity: Math.random() * 0.5 + 0.2,
    }));
  }, [particleCount, resolution]);

  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current; const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx || !fontsLoaded) return;
    canvas.width = resolution.width; canvas.height = resolution.height;
    ctx.fillStyle = backgroundColor; ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (style === "grid") {
      const gridSize = 40; ctx.strokeStyle = isLightBackground ? "rgba(0,0,0,0.1)" : "rgba(255,255,255,0.1)"; ctx.lineWidth = 1;
      for (let x = 0; x < canvas.width; x += gridSize) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke() }
      for (let y = 0; y < canvas.height; y += gridSize) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke() }
    } else if (style === "particles") {
      const particleColor = isLightBackground ? "#000000" : "#FFFFFF";
      particlesRef.current.forEach(p => {
        ctx.save(); ctx.globalAlpha = p.opacity; ctx.fillStyle = particleColor;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill(); ctx.restore();
      });
    }

    const baseSize = Math.min(resolution.width, resolution.height);
    const quoteSize = Math.floor(baseSize * 0.055); const authorSize = Math.floor(baseSize * 0.032); const sourceSize = Math.floor(baseSize * 0.025);
    const maxWidth = resolution.width * 0.8;

    ctx.font = `600 ${quoteSize}px "${font}", system-ui, sans-serif`; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    const quoteLines = wrapText(ctx, `"${quote}"`, maxWidth); const lineHeight = quoteSize * 1.3; const quoteHeight = quoteLines.length * lineHeight;
    let startY: number;
    if (layout === "centered") {
      const authorSourceHeight = (author ? authorSize * 1.6 : 0) + (source ? sourceSize * 1.6 : 0);
      const totalContentHeight = quoteHeight + authorSourceHeight + (authorSourceHeight > 0 ? quoteSize * 0.8 : 0);
      startY = (resolution.height - totalContentHeight) / 2;
    } else { startY = (resolution.height - quoteHeight) / 2 }

    if (highlightColor !== "none") {
      ctx.fillStyle = highlightColor; const padding = quoteSize * 0.15;
      quoteLines.forEach((line, i) => {
        const y = startY + i * lineHeight; const textWidth = ctx.measureText(line).width;
        ctx.beginPath(); ctx.roundRect((resolution.width - textWidth) / 2 - padding, y - quoteSize / 2 - padding, textWidth + padding * 2, quoteSize + padding * 2, 8); ctx.fill();
      });
    }

    ctx.fillStyle = adaptiveTextColor;
    quoteLines.forEach((line, i) => {
      const y = startY + i * lineHeight; ctx.fillText(line, resolution.width / 2, y);
      if (underline) {
        const textWidth = ctx.measureText(line).width; ctx.beginPath();
        ctx.moveTo((resolution.width - textWidth) / 2, y + quoteSize * 0.15); ctx.lineTo((resolution.width + textWidth) / 2, y + quoteSize * 0.15);
        ctx.strokeStyle = adaptiveTextColor; ctx.lineWidth = Math.max(2, quoteSize * 0.025); ctx.stroke();
      }
    });

    if (author || source) {
      if (layout === "centered") {
        let currentY = startY + quoteHeight + quoteSize * 0.8;
        if (author) { ctx.font = `600 ${authorSize}px "${font}", system-ui, sans-serif`; ctx.fillText(`— ${author}`, resolution.width / 2, currentY); currentY += authorSize * 1.6 }
        if (source) { ctx.font = `400 ${sourceSize}px "${font}", system-ui, sans-serif`; ctx.globalAlpha = 0.75; ctx.fillText(source, resolution.width / 2, currentY); ctx.globalAlpha = 1 }
      } else {
        ctx.textAlign = "right"; let bottomY = resolution.height * 0.92;
        if (source) { ctx.font = `400 ${sourceSize}px "${font}", system-ui, sans-serif`; ctx.globalAlpha = 0.75; ctx.fillText(source, resolution.width * 0.95, bottomY); bottomY -= sourceSize * 1.6; ctx.globalAlpha = 1 }
        if (author) { ctx.font = `600 ${authorSize}px "${font}", system-ui, sans-serif`; ctx.fillText(`— ${author}`, resolution.width * 0.95, bottomY) }
      }
    }
  }, [state, fontsLoaded, resolution, backgroundColor, isLightBackground, adaptiveTextColor, wrapText]);

  const animateParticles = useCallback((timestamp: number) => {
    const deltaTime = timestamp - lastFrameTime.current; lastFrameTime.current = timestamp; const speed = deltaTime * 0.01;
    particlesRef.current.forEach((p) => {
      p.x += p.vx * speed; p.y += p.vy * speed;
      if (p.x < 0) p.x = resolution.width; if (p.x > resolution.width) p.x = 0;
      if (p.y < 0) p.y = resolution.height; if (p.y > resolution.height) p.y = 0;
    });
    renderCanvas(); animationRef.current = requestAnimationFrame(animateParticles);
  }, [renderCanvas, resolution]);

  useEffect(() => {
    if (style === "particles") { initializeParticles(); animationRef.current = requestAnimationFrame(animateParticles) } 
    else { renderCanvas() }
    return () => { if (animationRef.current) cancelAnimationFrame(animationRef.current) };
  }, [state, fontsLoaded, initializeParticles, animateParticles, renderCanvas, style]);

  const downloadWallpaper = useCallback(() => {
    const canvas = canvasRef.current; if (!canvas) return; const link = document.createElement("a");
    link.download = `quote-wallpaper-${resolution.value}-${Date.now()}.png`; link.href = canvas.toDataURL("image/png", 1.0);
    link.click();
  }, [resolution]);

  return { canvasRef, downloadWallpaper, fontsLoaded };
}

// 5. UI SUB-COMPONENTS
interface SettingsPanelProps { state: WallpaperState; dispatch: Dispatch<WallpaperAction> }
const SettingsPanel: FC<SettingsPanelProps> = memo(({ state, dispatch }) => {
  const { quote, author, source, style, background, font, layout, textColor, underline, highlightColor, resolution, particleCount } = state;
  const handleFieldChange = (field: keyof WallpaperState) => (value: any) => { dispatch({ type: 'SET_FIELD', payload: { field, value } }) }
  const fontsByCategory = useMemo(() => {
    const script = /[\u0900-\u097F]/.test(quote) ? "devanagari" : "english";
    return FONTS.reduce((acc, f) => {
      if (f.script === script) { (acc[f.category] = acc[f.category] || []).push(f) }
      return acc;
    }, {} as Record<string, typeof FONTS>);
  }, [quote]);

  return (
    <div className="lg:col-span-1">
      <Card className="h-fit"><CardHeader className="border-b"><CardTitle className="flex items-center gap-2 text-lg"><Settings className="w-5 h-5" />Settings</CardTitle></CardHeader>
        <CardContent className="p-6">
          <Tabs defaultValue="content" className="w-full">
            <TabsList className="grid w-full grid-cols-3"><TabsTrigger value="content">Content</TabsTrigger><TabsTrigger value="style">Style</TabsTrigger><TabsTrigger value="advanced">Advanced</TabsTrigger></TabsList>
            <TabsContent value="content" className="mt-4 space-y-4">
              <div className="space-y-1.5"><Label htmlFor="quote">Quote</Label><Textarea id="quote" value={quote} onChange={e => handleFieldChange('quote')(e.target.value)} placeholder="Enter your quote..." className="min-h-[80px] resize-none" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5"><Label htmlFor="author">Author</Label><Input id="author" value={author} onChange={e => handleFieldChange('author')(e.target.value)} placeholder="Author name" /></div>
                <div className="space-y-1.5"><Label htmlFor="source">Source</Label><Input id="source" value={source} onChange={e => handleFieldChange('source')(e.target.value)} placeholder="Book, speech..." /></div>
              </div>
            </TabsContent>
            <TabsContent value="style" className="mt-4 space-y-4">
              <div><Label>Style</Label><div className="grid grid-cols-3 gap-2 mt-1">
                {WALLPAPER_STYLES.map((s) => (<button key={s.value} onClick={() => handleFieldChange('style')(s.value)} className={cn("p-3 border rounded-lg transition-all", style === s.value ? "border-blue-500 bg-blue-50 dark:border-white dark:bg-white/10" : "hover:bg-gray-50 dark:hover:bg-white/5")}><s.icon className="w-5 h-5 mx-auto mb-1" /><div className="text-xs font-medium">{s.name}</div></button>))}
              </div></div>
              <div className="space-y-1.5"><Label>Background</Label><Select value={background} onValueChange={handleFieldChange('background')}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{BACKGROUNDS.map(bg => <SelectItem key={bg.value} value={bg.value}><div className="flex items-center gap-2"><div className="w-3 h-3 rounded border" style={{ backgroundColor: bg.color }} />{bg.name}</div></SelectItem>)}</SelectContent></Select></div>
              <div className="space-y-1.5"><Label>Font</Label><Select value={font} onValueChange={handleFieldChange('font')}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent className="max-h-60">{Object.entries(fontsByCategory).map(([category, fonts]) => (<div key={category}><div className="px-2 py-1 text-xs font-semibold uppercase text-gray-500 dark:text-gray-400 border-t first:border-t-0">{category}</div>{fonts.map(f => <SelectItem key={f.value} value={f.value}><span style={{ fontFamily: f.value }}>{f.name}</span></SelectItem>)}</div>))}</SelectContent></Select></div>
              <div className="space-y-1.5"><Label>Layout</Label><RadioGroup value={layout} onValueChange={handleFieldChange('layout')} className="flex items-center space-x-4 mt-1"><div className="flex items-center space-x-2"><RadioGroupItem value="traditional" id="traditional" /><Label htmlFor="traditional" className="font-normal">Traditional</Label></div><div className="flex items-center space-x-2"><RadioGroupItem value="centered" id="centered" /><Label htmlFor="centered" className="font-normal">Centered</Label></div></RadioGroup></div>
              <div className="space-y-1.5"><Label>Text Color</Label><Input type="color" value={textColor} onChange={e => handleFieldChange('textColor')(e.target.value)} className="h-9" /></div>
              <div className="space-y-3 pt-2">
                <div className="flex items-center space-x-2"><Checkbox id="underline" checked={underline} onCheckedChange={checked => handleFieldChange('underline')(Boolean(checked))} /><Label htmlFor="underline" className="text-sm font-medium flex items-center gap-1.5"><Underline className="w-4 h-4" />Underline</Label></div>
                <div><Label className="text-sm font-medium flex items-center gap-1.5 mb-1.5"><Highlighter className="w-4 h-4" />Highlight</Label><Select value={highlightColor} onValueChange={handleFieldChange('highlightColor')}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{HIGHLIGHT_COLORS.map(c => <SelectItem key={c.value} value={c.value}>{c.name}</SelectItem>)}</SelectContent></Select></div>
              </div>
            </TabsContent>
            <TabsContent value="advanced" className="mt-4 space-y-4">
              <div className="space-y-1.5"><Label>Resolution</Label><Select value={resolution} onValueChange={handleFieldChange('resolution')}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{RESOLUTIONS.map(res => <SelectItem key={res.value} value={res.value}><div><div className="font-medium">{res.name}</div><div className="text-xs text-muted-foreground">{res.value}</div></div></SelectItem>)}</SelectContent></Select></div>
              {style === "particles" && (<div className="space-y-1.5"><Label>Particle Count: {particleCount}%</Label><Slider value={[particleCount]} onValueChange={([v]) => handleFieldChange('particleCount')(v)} max={100} min={10} step={10} className="mt-2" /></div>)}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
});
SettingsPanel.displayName = 'SettingsPanel';

interface CanvasPreviewProps { state: WallpaperState }
const CanvasPreview: FC<CanvasPreviewProps> = memo(({ state }) => {
  const { canvasRef, downloadWallpaper, fontsLoaded } = useCanvasRenderer(state);
  return (
    <div className="lg:col-span-2">
      <Card><CardHeader className="border-b"><CardTitle className="flex items-center gap-2 text-lg"><Palette className="w-5 h-5" />Preview</CardTitle></CardHeader>
        <CardContent className="p-6">
          <div className="relative">
            {!fontsLoaded && (<div className="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-background/80 backdrop-blur-sm"><div className="flex items-center gap-2"><RefreshCw className="w-4 h-4 animate-spin" /><span className="text-sm">Loading fonts...</span></div></div>)}
            <canvas ref={canvasRef} className="w-full h-auto rounded-lg shadow-sm border" style={{ maxHeight: "500px", objectFit: "contain" }} />
          </div>
          <div className="mt-4"><Button onClick={downloadWallpaper} disabled={!fontsLoaded} className="w-full"><Download className="w-4 h-4 mr-2" /> Download Wallpaper</Button></div>
        </CardContent>
      </Card>
    </div>
  )
});
CanvasPreview.displayName = 'CanvasPreview';

// 6. MAIN COMPONENT (WITH PERFORMANCE OPTIMIZATION)


export default function QuoteWallpaperGenerator() {
  const [state, dispatch] = useReducer(wallpaperReducer, initialState);
  const { isDarkTheme, toggleTheme } = useThemeManager();

  // --- PERFORMANCE OPTIMIZATION ---
  // Debounce the state that is passed to the expensive canvas renderer.
  // This prevents canvas re-renders on every keystroke or slider move, fixing INP issues.
  const debouncedCanvasState = useDebounce(state, 250);

  return (
    <div className="min-h-screen bg-white dark:bg-black text-gray-900 dark:text-white transition-colors duration-300">
      <div className="max-w-7xl mx-auto p-6">
        <header className="text-center mb-8">
          <div className="flex items-center justify-center gap-4 mb-4">
            <h1 className="text-3xl font-bold">Quote Wallpaper Generator</h1>
            <Button variant="outline" size="icon" onClick={toggleTheme}>
              {isDarkTheme ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              <span className="sr-only">Toggle theme</span>
            </Button>
          </div>
          <p className="text-gray-600 dark:text-gray-400">Create beautiful wallpapers with your favorite quotes</p>
        </header>

        <main className="grid lg:grid-cols-3 gap-6 items-start">
          {}
          <SettingsPanel state={state} dispatch={dispatch} />
          {}
          <CanvasPreview state={debouncedCanvasState} />
        </main>
      </div>
    </div>
  )
}