import 'package:flutter/material.dart';
import '../theme.dart';

class SettingsPage extends StatelessWidget {
  const SettingsPage({super.key});
  Widget row(IconData i, String t, String s) => Container(margin: const EdgeInsets.only(bottom: 10), decoration: cardBox(),
    child: ListTile(leading: Icon(i, color: C.gold), title: Text(t), subtitle: Text(s, style: const TextStyle(color: C.mute)),
      trailing: const Icon(Icons.chevron_left, color: C.mute)));
  @override
  Widget build(BuildContext c) => ListView(padding: const EdgeInsets.fromLTRB(18, 14, 18, 24), children: [
    Text('حسابي', style: Theme.of(c).textTheme.headlineMedium?.copyWith(fontWeight: FontWeight.w800)),
    const SizedBox(height: 16),
    row(Icons.calculate_rounded, 'طريقة حساب المواقيت', 'أم القرى'),
    row(Icons.notifications_active_rounded, 'الأذان والتنبيهات', 'قريبًا'),
    row(Icons.text_fields_rounded, 'حجم الخط', 'قريبًا'),
    row(Icons.dark_mode_rounded, 'المظهر', 'قريبًا'),
    row(Icons.cloud_sync_rounded, 'الحساب والمزامنة', 'قريبًا')]);
}
