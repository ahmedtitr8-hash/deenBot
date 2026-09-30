import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../theme.dart';

class AzkarPage extends StatelessWidget {
  const AzkarPage({super.key});
  Future<List> load() async => jsonDecode(await rootBundle.loadString('assets/azkar.json'));
  @override
  Widget build(BuildContext c) => FutureBuilder<List>(future: load(), builder: (c, s) {
    if (!s.hasData) return const Center(child: CircularProgressIndicator());
    return ListView(padding: const EdgeInsets.all(16), children: [
      for (final g in s.data!) Card(child: ListTile(title: Text(g['cat'], style: const TextStyle(fontSize: 20)),
        trailing: const Icon(Icons.chevron_left, color: C.gold),
        onTap: () => Navigator.push(c, MaterialPageRoute(builder: (_) => _Group(g)))))]);
  });
}

class _Group extends StatelessWidget {
  final Map g; const _Group(this.g);
  @override
  Widget build(BuildContext c) => Scaffold(appBar: AppBar(title: Text(g['cat'])),
    body: ListView(padding: const EdgeInsets.all(16), children: [
      for (final i in g['items']) _Counter(i['t'], i['n'])]));
}

class _Counter extends StatefulWidget { final String t; final int n; const _Counter(this.t, this.n); @override State<_Counter> createState() => _CS(); }
class _CS extends State<_Counter> {
  late int left = widget.n;
  @override
  Widget build(BuildContext c) => Card(child: InkWell(borderRadius: BorderRadius.circular(18),
    onTap: () { if (left > 0) { HapticFeedback.selectionClick(); setState(() => left--); } },
    child: Padding(padding: const EdgeInsets.all(20), child: Column(children: [
      Text(widget.t, textAlign: TextAlign.center, style: quranStyle(22)),
      const SizedBox(height: 8),
      Text(left == 0 ? '✓' : '$left', style: const TextStyle(fontSize: 24, color: C.gold))]))));
}
