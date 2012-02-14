Helpers = 
	round: (num) -> (0.5 + num) << 0  # helper func for drawing images
	inRect: (x, y, x2, y2, w, h) -> return (x > x2 && x < x2+w && y > y2 && y < y2+h)