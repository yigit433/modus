use std::time::Instant;

fn main() {
    #[cfg(target_os = "macos")]
    {
        use core_graphics::display::{CGRect, CGPoint, CGSize};
        use core_graphics::window::{CGWindowListCreateImage, kCGWindowListOptionOnScreenOnly, kCGNullWindowID, kCGWindowImageDefault};
        
        let start = Instant::now();
        let rect = CGRect::new(&CGPoint::new(0.0, 0.0), &CGSize::new(200.0, 200.0));
        let cg_img = CGWindowListCreateImage(
            rect,
            kCGWindowListOptionOnScreenOnly,
            kCGNullWindowID,
            kCGWindowImageDefault,
        ).unwrap();
        
        println!("CGWindowListCreateImage took: {:?}", start.elapsed());
        println!("w: {}, h: {}", cg_img.width(), cg_img.height());
    }
}
