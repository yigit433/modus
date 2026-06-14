fn main() {
    let monitors = xcap::Monitor::all().unwrap();
    for m in monitors {
        println!("Monitor: {}x{} @ {},{} | Scale factor: {}", 
            m.width().unwrap_or(0), 
            m.height().unwrap_or(0), 
            m.x().unwrap_or(0), 
            m.y().unwrap_or(0), 
            m.scale_factor().unwrap_or(1.0)
        );
        let image = m.capture_image().unwrap();
        println!("  -> Image size: {}x{}", image.width(), image.height());
        
        let mut all_black = true;
        for p in image.pixels() {
            if p[0] != 0 || p[1] != 0 || p[2] != 0 {
                all_black = false;
                break;
            }
        }
        println!("  -> Is all black: {}", all_black);
    }
}
