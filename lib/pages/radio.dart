import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:just_audio/just_audio.dart';
import '../theme.dart';

class RadioPage extends StatefulWidget { const RadioPage({super.key}); @override State<RadioPage> createState() => _R(); }
class _R extends State<RadioPage> {
  final player = AudioPlayer(); List radios = []; String? now; String? err;
  @override
  void initState() { super.initState(); load(); }
  Future<void> load() async {
    try {
      final r = await http.get(Uri.parse('https://mp3quran.net/api/v3/radios?language=ar'));
      setState(() => radios = jsonDecode(utf8.decode(r.bodyBytes))['radios']);
    } catch (_) { setState(() => err = 'تعذر التحميل. تأكد من الاتصال بالإنترنت'); }
  }
  Future<void> play(Map r) async { setState(() => now = r['name']); await player.setUrl(r['url']); player.play(); }
  @override
  void dispose() { player.dispose(); super.dispose(); }
  @override
  Widget build(BuildContext c) => err != null ? Center(child: Text(err!)) : ListView(padding: const EdgeInsets.fromLTRB(18, 14, 18, 24), children: [
    Text('الراديو', style: Theme.of(c).textTheme.headlineMedium?.copyWith(fontWeight: FontWeight.w800)),
    const SizedBox(height: 16),
    PatternBox(child: SizedBox(width: double.infinity, child: Row(children: [
      Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Text(now == null ? 'اختر إذاعة' : 'يعمل الآن', style: const TextStyle(color: C.mute)),
        const SizedBox(height: 6),
        Text(now ?? 'إذاعات القرآن الكريم', maxLines: 2, overflow: TextOverflow.ellipsis,
          style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w700))])),
      StreamBuilder<bool>(stream: player.playingStream, builder: (c, s) => GestureDetector(
        onTap: () => s.data == true ? player.pause() : player.play(),
        child: Container(width: 64, height: 64, decoration: const BoxDecoration(color: C.gold, shape: BoxShape.circle),
          child: Icon(s.data == true ? Icons.pause_rounded : Icons.play_arrow_rounded, color: C.ink, size: 36))))]))),
    const SizedBox(height: 18),
    if (radios.isEmpty) const Center(child: CircularProgressIndicator(color: C.gold)),
    for (final r in radios) Container(margin: const EdgeInsets.only(bottom: 10), decoration: cardBox(r['name'] == now ? C.gold.withOpacity(.10) : null),
      child: ListTile(title: Text(r['name']), leading: Icon(Icons.graphic_eq_rounded, color: r['name'] == now ? C.gold : C.mute),
        onTap: () => play(r)))]);
}
