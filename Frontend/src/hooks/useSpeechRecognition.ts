import { useCallback, useEffect, useRef, useState } from "react";

// Web Speech API chưa có type chuẩn trong lib.dom.d.ts — khai báo tối thiểu
// đủ dùng, tránh phụ thuộc thêm package @types.
interface SpeechRecognitionResultLike {
  isFinal: boolean;
  0: { transcript: string };
}
interface SpeechRecognitionEventLike extends Event {
  resultIndex: number;
  results: ArrayLike<SpeechRecognitionResultLike>;
}
interface SpeechRecognitionLike extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: Event & { error?: string }) => void) | null;
  onend: (() => void) | null;
}

function getSpeechRecognitionCtor(): (new () => SpeechRecognitionLike) | null {
  const w = window as any;
  return w.SpeechRecognition || w.webkitSpeechRecognition || null;
}

export interface UseSpeechRecognitionOptions {
  lang?: string;
  /** Gọi mỗi khi có 1 đoạn transcript đã CHỐT (final) — caller tự quyết định nối vào state của mình. */
  onFinalResult?: (text: string) => void;
}

export interface UseSpeechRecognitionResult {
  isSupported: boolean;
  isListening: boolean;
  interimText: string;
  error: string | null;
  start: () => void;
  stop: () => void;
}

/** Logic Web Speech API (chép lời giọng nói client-side) tách khỏi UI, để
 * tái sử dụng cho cả module Ghi âm cuộc họp lẫn input giọng nói của Trợ lý sau này. */
export function useSpeechRecognition(options: UseSpeechRecognitionOptions = {}): UseSpeechRecognitionResult {
  const { lang = "vi-VN", onFinalResult } = options;

  const [isListening, setIsListening] = useState(false);
  const [interimText, setInterimText] = useState("");
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const onFinalResultRef = useRef(onFinalResult);
  onFinalResultRef.current = onFinalResult;

  const isSupported = getSpeechRecognitionCtor() !== null;

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
    };
  }, []);

  const start = useCallback(() => {
    if (isListening) return;

    const Ctor = getSpeechRecognitionCtor();
    if (!Ctor) {
      setError("Trình duyệt này không hỗ trợ chép lời giọng nói (dùng Chrome/Edge để có trải nghiệm tốt nhất)");
      return;
    }

    const recognition = new Ctor();
    recognition.lang = lang;
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const text = result[0].transcript;
        if (result.isFinal) {
          onFinalResultRef.current?.(text);
        } else {
          interim += text;
        }
      }
      setInterimText(interim);
    };

    recognition.onerror = (event) => {
      setError((event as any).error || "Lỗi chép lời không xác định");
    };

    recognition.onend = () => {
      setIsListening(false);
      setInterimText("");
    };

    recognitionRef.current = recognition;
    setError(null);
    setIsListening(true);
    recognition.start();
  }, [isListening, lang]);

  const stop = useCallback(() => {
    recognitionRef.current?.stop();
    setIsListening(false);
  }, []);

  return { isSupported, isListening, interimText, error, start, stop };
}
