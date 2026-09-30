import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:just_audio/just_audio.dart';
import '../theme.dart';

class RadioPage extends StatefulWidget { const RadioPage({super.key}); @override State<RadioPage> createState() => _R(); }
class _R extends State<RadioPage> {
  final player = AudioPlayer();
  List radios = []; String? now; String? err;
  @override
  void initState() { super.initState(); load(); }
  Future<void> load() async {
    try {
      final r = await http.get(Uri.parse('https://mp3quran.net/api/v3/radios?language=ar'));
      setState(() => radios = jsonDecode(utf8.decode(r.bodyBytes))['radios']);
    } catch (_) { setState(() => err = 'تعذر التحميل. تأكد من الاتصال بالإنترنت'); }
  }
  Future<void> play(Map r) async {
    setState(() => now = r['name']);
    await player.setUrl(r['url']); player.play();
  }
  @override
  void dispose() { player.dispose(); super.dispose(); }
  @override
  Widget build(BuildContext c) => err != null ? Center(child: Text(err!)) : Column(children: [
    Expanded(child: ListView.builder(padding: const EdgeInsets.all(16), itemCount: radios.length,
      itemBuilder: (c, i) => Card(child: ListTile(title: Text(radios[i]['name']),
        leading: const Icon(Icons.play_circle, color: C.gold), onTap: () => play(radios[i]))))),
    if (now != null) Container(color: C.panel, padding: const EdgeInsets.all(12), child: Row(children: [
      Expanded(child: Text(now!, overflow: TextOverflow.ellipsis)),
      StreamBuilder<bool>(stream: player.playingStream, builder: (c, s) => IconButton(
        icon: Icon(s.data == true ? Icons.pause : Icons.play_arrow, color: C.gold),
        onPressed: () => s.data == true ? player.pause() : player.play()))]))]);
}
